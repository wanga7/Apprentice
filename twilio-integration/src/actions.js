/**
 * actions.js
 *
 * exports the actions used in the texting service
 */

const MessageAction = (destination,message) => {
  return {
    type: "SEND_MESSAGE",
    params: {
      destination: destination,
      message: message
    }
  }
};

const HandleMessageAction = message => {
  if (message.Body === 'CONNECT') {
    return {
      type: "CONFIRM_TUTOR",
      params: {
        ...message
      }
    }
  } else if (message.Body === 'DENY') {
    return {
      type: "DENY_TUTOR",
      params: {
        ...message
      }
    }
  }
  return {
    type: "INVALID_MESSAGE",
    params: {
      ...message
    }
  }
};

module.exports = {
  MessageAction: MessageAction,
  HandleMessageAction: HandleMessageAction
};