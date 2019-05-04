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
   * GET /v1/messages/:message_id
   *  returns the message with the id ':id'
   *
   *  @param message_id - ObjectId of message object
   *
   *  TODO: populate is not tested yet!!!
   *  @param populate(optional) - if true, populates the connection object
   *  @return 200 on success with message object
   *  @return 400 on error
   *  @return 404 on document not found
   */
  app.get("/v1/messages/:message_id", async (req, res) => {
    try {
      const query = Message.findById(req.query.message_id);
      if (req.params.populate && req.params.populate === true)
        query.populate("connection_id");

      const document = await query.exec();
      if (!document)
        return res.sendStatus(404);

      res.status(200).send(document);
    } catch (err) {
      logError("GET /v1/messages/:message_id", "server error", err);
      res.status(400).send({ error: err });
    }
  });

  /**
   * POST /v1/messages
   *  creates a new connection between the source and the target
   *
   *  @req.body.content - string containing the body of the message
   *  @req.body.connection_id - ObjectId of connection containing the message
   *  @req.body.sender - ObjectId of the user who sent the message
   *  @req.body.receiver - ObjectId of the user who sent the message
   *  @req.body.mediaUrl(optional) - fully formed URL
   *
   *  @return 201 with {connection_id and content} if succeeds
   *  @return 400 if fails
   */
  app.post("/v1/messages", async (req, res, next) => {
      const schema = Joi.schema().keys({
        connection_id: Joi.string().required(),
        content: Joi.string().required(),
        sender: Joi.string().required(),
        receiver: Joi.string().required(),
        mediaUrl: Joi.string(),
      });
      try {
        req.body = await validateAsync(req.body, schema);
        next();
      } catch (err) {
        console.log(err);
        res.status(400).send({ error: err.error });
      }
    }, async (req, res, next) => {
      try {
        // does the connection exist in the database?
        const document = await Connection.findById(req.body.connection_id);
        if (!document)
          throw new Error("invalid connection_id");

        next();
      } catch (err) {
        console.error(`ERROR: [POST /v1/messages] connection with object_id ${req.body.conneciton_id} DNE`);
        res.status(400).send({ error: err });
      }
    }, async (req,res,next) => {
      try {
        // do both users exist in the database?
        const query = User.find().or([
          {_id: req.body.sender},
          {_id: req.body.receiver},
        ]);
        const documents = await query.exec();

        if (documents.length !== 2)
          throw new Error('both sender and receiver must exist in database');

        next();
      } catch (err) {
        logError('POST /v1/messages','sender/receiver malformed objectid',err);
        res.status(400).send(err);
      }

    }, async (req, res) => {
      try {
        // req.body contains only valid information
        let message = new app.models.Message(req.body);
        await message.save();

        res.status(204).send(message);
      } catch (err) {
        console.error(`ERROR: [POST /v1/messages] mongodb error \n${err}`);
        res.status(400).send(err);
      }
    }
  );

  /**
   * PUT /v1/messages/:message_id
   *  updates the document with _id === message_id
   *  if no match, equivalent to a NOP
   *
   *  @param message_id: id of document to update
   *  @body content(optional): string content of new message
   *  @body mediaUrl(optional): string containing the media content of message
   *
   *  @return 200 on success with { message_id, content, date_created }
   *  @return 204 on content not being specified in body
   */
  app.put("/v1/messages/:message_id", async (req, res, next) => {
    try {
      const schema = Joi.schema().keys({
        content: Joi.string(),
        mediaUrl: Joi.string(),
      });
      req.body = await validateAsync(req.body, schema);

      if (Object.keys(req.body).length === 0)
        return res.sendStatus(204);

      next();
    } catch (err) {
      logError('PUT /v1/messages/:message_id','unknown joi error', err);
      res.status(400).send({ error: err });
    }
  }, async (req,res) => {
    try {
      // could use findByIdAndUpdate, but findByIdAndUpdate doesn't run validators
      //  on the document, and we need to sanitize strings pre-save
      const document = await Message.findById(req.params.message_id);
      if (!document)
        return res.status(404);

      document.content = req.body.content;
      await document.save();

      res.status(200).send(document);
    } catch (err) {
      logError("PUT /v1/messages/:message_id", "error fetching/updating document", err);
      res.status(400).send({ error: err });
    }
  });

  /**
   * DELETE /v1/messages/:message_id
   *  deletes the resource specified by message_id
   *
   *  @return 200 with { connection_id, content, and date } on success
   *  @return 404 if document not found
   */
  app.delete("/v1/messages/:message_id", async (req, res) => {
    try {
      const document = await Message.findByIdAndDelete(req.params.message_id);
      if (!document)
        return res.sendStatus(404);

      res.status(200).send(document);
    } catch (err) {
      console.log("DELETE /v1/messages/:message_id", "error removing document", err);
      res.status(400).send({ error: err });
    }
  });
};

