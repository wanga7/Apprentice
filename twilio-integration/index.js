/**
 * entry point for the service
 *  1. forks a child and has child run job queue
 *  2. runs a web server to send/receive text messages
 */

const cluster = require('cluster');
require('dotenv').config();

const redis = require('redis'),
    client = redis.createClient(),
    MessageQueue = require('./lib/message-queue'),
    queue = new MessageQueue(client);

if (cluster.isMaster) {
  cluster.fork();

  const setupServer = require('./src/setup-server');
  setupServer(queue);

} else {
  const runWorker = require('./src/message-worker');
  runWorker(queue);
}
