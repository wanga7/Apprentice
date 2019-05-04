const request = require("request-promise-native"),
  actions = require("./actions"),
  router = require("express").Router(),
  MessageQueue = require("../lib/message-queue"),
  queue = new MessageQueue(process.env.QUEUE_NAME);

const createConnection = async (source, destination) => {
  return await request.post(
    "http://localhost:8080/v1/connection",
    {
      json: true,
      body: {
        connector: source,
        connectee: destination
      }
    });
};

const fetchUserByEmail = async phone => {
  return await request.get(`http://localhost:8080/v1/connection/connectee/${phone}`, {
    json: true
  });
};

const makeInitiateMessage = connection => {
  return `Hello ${connection.connectee.first_name}! This is ApprenticeBot.
  ${connection.connector.first_name} would like to get in contact with you 
  about tutoring.  To connect, respond 'CONNECT', otherwise respond 'DENY'`;
};

const emit = async action => {
  let res = await queue.postMessage(action);
  console.log("Message posted: ", res);
};

/**
 * handles the receiving of messages
 */
router.post("/messages", async (req, res, next) => {
    try {
      let phone = req.body.From;
      phone = phone.substr(2);

      req.body.connection = await fetchUserByEmail(phone);
      next();
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  }, (req, res) => {
    emit(actions.HandleMessageAction(req.body));

    // TODO: this for some reason returns OK to the user via text?
    // res.sendStatus(200);
  }
);

/**
 * entry point of the service
 *
 * @param connector: email of the requesting tutor
 * @param connectee: email of the requested tutor
 */
router.post("/initiateConnection", async (req, res) => {
  try {
    // create connection in DB
    const connection = await createConnection(req.body.connector, req.body.connectee);

    // load message into messaging queue
    const source = connection.connectee.phone;
    const message = makeInitiateMessage(connection);
    emit(actions.MessageAction(
      source,
      message
    ));

    res.sendStatus(201);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
