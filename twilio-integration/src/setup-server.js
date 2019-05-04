const express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  path = require('path');

const PORT = 8081;

const cors = (req,res,next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
};


const setupServer = async () => {
  app.use(cors);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(express.static(path.join(__dirname, "../public")));

  app.use(require('./routes'));

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};


module.exports = setupServer;
