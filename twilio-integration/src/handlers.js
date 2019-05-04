const twilio = require('../lib/twilio');
const request = require('request-promise-native');

const confirmTutor = id => {
  return request.put(`http://localhost:8080/v1/connection/${id}`,{
    json: true,
    body: {
      status: "ACCEPTED"
    }
  })
};

const denyTutor = id => {
  return request.put(`http://localhost:8080/v1/connection/${id}`,{
    json: true,
    body: {
      status: "DENIED"
    }
  })
};

const handler = async action => {
  if (action.type === "SEND_MESSAGE") {
    try {
      await twilio.sendMessage(action.params.destination, action.params.message);

      console.log('Handling action: ', action);
    } catch (err) {
      console.error('error :(', err);
      return { error : "twilio error" };
    }
  } else if (action.type === "CONFIRM_TUTOR") {
    const connection = action.params.connection;

    try {
      // update database
      await confirmTutor(connection._id);

      await twilio.sendVCard(
        connection.connector.phone,
        `${connection.connectee.first_name} has accepted your connection.  We have attached their contact information.`,
        connection.connectee.email,
      );

      await twilio.sendVCard(
        connection.connectee.phone,
        `You have accepted ${connection.connector.first_name}'s request. Here is their contact information!`,
        connection.connector.email,
      );

      console.log('Handled action: tutor confirmed.')
    } catch (err) {
      console.log(err);
    }
  } else if (action.type === "DENY_TUTOR"){
    const connection = action.params.connection;
    try {
      await denyTutor(connection._id);

      await twilio.sendMessage(
        connection.connectee.phone,
        `You have denied ${connection.connector.first_name}'s request to connect.`,
      );

      // update status in db to denied
      console.log('Handled action: tutor denied.')
    } catch (err) {
      console.error(err);
    }
  } else if (action.type === "INVALID_MESSAGE") {
    // error handling here?
  }
};

module.exports.handle = handler;