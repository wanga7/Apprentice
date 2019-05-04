const Joi = require("joi");

const validateAsync = (data, schema) => new Promise((resolve, reject) => {
  Joi.validate(data, schema, { stripUnknown: true }, (err, data) => {
    if (err) {
      reject({ error: err.details[0].message });
    } else {
      resolve(data);
    }
  });
});

const logError = (route, message, err) => {
  console.error(`ERROR: [${route}] ${message} ${err}`);
};

module.exports = app => {
  const Connection = app.models.Connection;
  const Message = app.models.Message;
  const User = app.models.User;

  /**
   * check status of connection
   */
  app.get('/v1/connection/status',async (req,res) => {
    try {
      const query = Connection.findOne({
        $or: [
          {
            'connector.email': req.query.connector,
            'connectee.email': req.query.connectee,
          },
          {
            'connector.email': req.query.connectee,
            'connectee.email': req.query.connector,
          }
        ]
      });

      const document = await query.exec();

      if (!document)
        return res.sendStatus(404);

      res.status(200).send({ status : document.status });
    } catch (err) {
      logError("GET /v1/connection/:connection_id", "server error", err);
      res.status(400).send({ error: err });
    }
  });

  /**
   * GET /v1/connection/:connection_id
   *  returns the message with the id ':connection_id'
   *
   *  @param message_id - ObjectId of connection object
   *  @return 200 on success with connection object
   *  @return 400 on error
   *  @return 404 on document not found
   */
  app.get("/v1/connection/:connection_id", async (req, res) => {
    try {
      const query = Connection.findById(req.params.connection_id);
      const document = await query.exec();

      // document not found
      if (!document)
        return res.sendStatus(404);

      res.status(200).send(document);
    } catch (err) {
      logError("GET /v1/connection/:connection_id", "server error", err);
      res.status(400).send({ error: err });
    }
  });


  app.get('/v1/connection/connectee/:connectee_phone',async (req,res) => {
    try {
      console.log(req.params);
      const query = Connection.findOne({
        'connectee.phone': req.params.connectee_phone
      });
      const document = await query.exec();

      // document not found
      if (!document)
        return res.sendStatus(404);

      res.status(200).send(document);
    } catch (err) {
      logError("GET /v1/connection/:connection_id", "server error", err);
      res.status(400).send({ error: err });
    }
  });


  /**
   * POST /v1/connection
   *  creates a new connection between the source and the target
   *
   *  TODO: refactor to support ObjectId creation as well
   *  @req.body.connector - email (id) of user who initiates the connection
   *  @req.body.connectee - email (id) of user who is being connected with
   *  @use_email (optional) - specifies that req.body.connector && req.body.connectee
   *      are valid emails.  if set to true, the users for the connection will be
   *      located by their emails.  if false, req.body.connector && req.body.connectee
   *      are assumed to be ObjectId's.  if left unspecified, defaults to true
   *
   *  @return 201 with {connection_id and content} if succeeds
   *  @return 400 if fails
   */
  app.post("/v1/connection", async (req, res, next) => {
      const schema = Joi.object().keys({
        connector: Joi.string().email().required(),
        connectee: Joi.string().email().required(),
      });
      try {
        req.body = await validateAsync(req.body, schema);
        next();
      } catch (err) {
        logError('/POST /v1/connection','validation error', err);
        res.status(400).send({ error: err.error });
      }
    }, async (req, res, next) => {
      try {
        // valid fields in query parameters
        req.body.connectee = await User.findOne({
          email: req.body.connectee
        },'_id email phone first_name last_name');

        req.body.connector = await User.findOne({
          email: req.body.connector
        },'_id email phone first_name last_name');

        if (!req.body.connectee || !req.body.connector)
          return res.status(404).send({error : "users not found"});

        if (req.body.connector.email === req.body.connectee.email)
          return res.status(400).send({ error: "cannot create connection to oneself"});

        next();
      } catch (err) {
        logError('/POST /v1/connection','user find error', err);
        res.status(400).send({ error: err });
      }
    }, async (req,res) => {
      // All data is valid!
      try {
        const payload = {
          connector: req.body.connector,
          connectee: req.body.connectee,
          status: 'REQUESTING_TUTOR',
        };

        const connection = new Connection(payload);
        await connection.save();

        res.status(201).send(connection);
      } catch (err) {
        logError('POST /v1/messages','could not create connection document',err);
        res.status(400).send({ error: err });
      }

    });

  /**
   * PUT /v1/messages/:connection_id
   *  updates the document with _id === message_id
   *  if no match, equivalent to a NOP
   *
   *  @param connection_id: id of document to update
   *  @body status(optional): new status to upload
   *    status must be 'REQUESTING_TUTOR', 'ACCEPTED", "DENIED'
   *
   *  @return 200 on success with { message_id, content, date_created }
   *  @return 204 on content not being specified in body
   */
  app.put("/v1/connection/:connection_id", async (req, res, next) => {
    if (!('status' in req.body))
      return res.sendStatus(204);

    try {
      // could use findByIdAndUpdate, but findByIdAndUpdate doesn't run validators
      //  on the document, and we need to sanitize strings pre-save
      const document = await Connection.findById(req.params.connection_id);
      if (!document)
        return res.status(404);

      document.status = req.body.status;
      await document.save();

      res.status(200).send(document);
    } catch (err) {
      logError("PUT /v1/connection/:connection_id", "error fetching/updating document", err);
      res.status(400).send({ error: err });
    }
  });

  /**
   * DELETE /v1/connection/:connection_id
   *  deletes the resource specified by connection_id
   *
   *  @return 200 with { status, connector, and connectee } on success
   *  @return 404 if document not found
   */
  app.delete("/v1/connection/:connection_id", async (req, res) => {
    try {
      const document = await Connection.findByIdAndDelete(req.params.connection_id);
      if (!document)
        return res.sendStatus(404);

      res.status(200).send(document);
    } catch (err) {
      console.log("DELETE /v1/connection/:connection_id", "error removing document", err);
      res.status(400).send({ error: err });
    }
  });
};
