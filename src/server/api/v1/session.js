/* Copyright G. Hemingway @2018 - All rights reserved */
"use strict";

let Joi = require("joi");

module.exports = app => {
  /**
   * Log a user in
   *
   * @param {req.body.username} Username of user trying to log in
   * @param {req.body.password} Password of user trying to log in
   * @return { 200, {username, primary_email} }
   */
  app.post("/v1/session", (req, res) => {
    // Validate incoming request has username and password, if not return 400:'username and password are required'
    console.log(req.body);
    let schema = Joi.object().keys({
      email: Joi.string()
        .lowercase()
        .required()
    });
    Joi.validate(req.body, schema, { stripUnknown: true }, (err, data) => {
      if (err) {
        const message = err.details[0].message;
        console.log(`Session.login validation failure: ${message}`);
        res.status(400).send({ error: message });
      } else {
        // Search database for user
        app.models.User.findOne({ email: data.email }, (err, user) => {
          // If not found, return 401:unauthorized
          if (err) res.status(500).send({ error: "internal server error" });
          else if (!user) res.status(401).send({ error: "unauthorized" });
          // If found, compare hashed passwords
            // Regenerate session when signing in to prevent fixation
            req.session.regenerate(() => {
              req.session.user = user;
              console.log(
                `Session.login success: ${req.session.user.email}`
              );
              // If a match, return 201:{ username, primary_email }
              res.status(200).send({
                email: user.email,
              });
            });
        });
      }
    });
  });

  /**
   * Log a user out
   *
   * @return { 204 if was logged in, 200 if no user in session }
   */
  app.delete("/v1/session", (req, res) => {
      if (req.session.user) {
          req.session.destroy(() => {
              console.log('logged out');
              res.status(204).send("successfully logged out");
          });
      } else {
          res.status(200).end();
      }
  });
};
