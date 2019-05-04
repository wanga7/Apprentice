const twilio = require('twilio');

let accountSid = process.env.TWILIO_ACCOUNT_SID
let authToken = process.env.TWILIO_AUTH_TOKEN

let client = new twilio(accountSid, authToken);
const source = process.env.TWILIO_NUMBER;

const createVCard = require('./vard-generator');


/**
 * sendMessage
 * @brief sends a text message utilizing Twilio
 * @param source: valid phone number for the source
 * @param destination: 
 * @param body: 
 * @param media(optional):
 *
 * all phone numbers are in the form '+1xxxxxxxxxx'
 */
const sendMessage = async (destination, body) => {
  console.log('Sending message to: ', destination);
    return client.messages.create({
            to: destination,
            from: source,
            body: body,
    });
};

/**
 * sendMessage
 * @brief sends a text message utilizing Twilio
 * @param source: valid phone number for the source
 * @param destination:
 * @param body:
 * @param media(optional):
 *
 * all phone numbers are in the form '+1xxxxxxxxxx'
 */
const sendVCard = async (destination, body, email) => {
  try {
    await createVCard(email);

    const mediaUrl = `http://5796f923.ngrok.io/${email}.vcf`;

    return client.messages.create({
      to: destination,
      from: source,
      body: body,
      mediaUrl: mediaUrl,
    });
  } catch (err) {
    console.error(err);
  }

};

module.exports.sendMessage = sendMessage;
module.exports.sendVCard = sendVCard;
