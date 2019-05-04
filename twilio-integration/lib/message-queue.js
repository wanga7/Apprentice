/**
 * class MessageQueue
 *  a class to abstract the posting and sending of messages
 *
 *  uses redis as a backend to store the job queue
 */

const redis = require('redis');

class MessageQueue {
  constructor(queueName){
    this.client = redis.createClient();
    this.queueName = queueName;
    this.queue = `queue:${this.queueName}`;
  }

  postMessage(message) {
    const data = JSON.stringify(message);

    return new Promise((resolve,reject) => {
      this.client.rpush(this.queue, data, (err,res) => {
        if (err) reject(err);
        else
          resolve(res);
      });
    });
  }

  getMessage() {
    return new Promise((resolve,reject) => {
      this.client.lpop(this.queue,(err,res) => {
        if (err) reject(err);
        else {
          const data = JSON.parse(res);
          resolve(data);
        }
      })
    })
  }
}


module.exports = MessageQueue;