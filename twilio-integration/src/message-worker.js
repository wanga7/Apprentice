const handler = require('./handlers');

const MessageQueue = require('../lib/message-queue');

const getTask = async queue => {
  const data = await queue.getMessage();
  if (!data)
    return;

  const error = await handler.handle(data);
  if (error)
    console.error('error: ', error.message);
};

const runWorker = () => {
  // may be a better way to do this, but for now just listen every 500ms to see
  //  if job has been posted

  const queue = new MessageQueue(process.env.QUEUE_NAME);
  setInterval(getTask,1000,queue);
};

module.exports = runWorker;