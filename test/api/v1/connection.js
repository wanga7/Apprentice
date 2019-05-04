/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

let should = require("should"),
  chai  = require('chai'),
  expect = chai.expect,
  assert = require("assert");

const request = require("superagent");

const baseUrl = 'http://localhost:8080/v1';

/**************************************************************************/

let conf = {
  port: 8080,
  redis: {
    host: 'localhost',
    port: 6379
  },
  mongodb: `mongodb://localhost:27017/apprentice-${process.env.PRODUCTION ? 'production' : 'dev'}`
};

describe("Connection:", () => {
  let primaryAgent = request.agent();

  const connection = {};

  describe("Create new connection:", () => {
    it("Failure - missing connectee", done => {
      primaryAgent
        .post(`${baseUrl}/connection`)
        .send({
          connector: "bailey.pearson@vanderbilt.edu"
        })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(`"connectee" is required`);
          done();
      });
    });

    it("Failure - missing connector", done => {
      primaryAgent
        .post(`${baseUrl}/connection`)
        .send({
          connectee: "bailey.pearson@vanderbilt.edu"
        })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(`"connector" is required`);
          done();
        });
    });

    it("Failure - one user not in database", done => {
      primaryAgent
        .post(`${baseUrl}/connection`)
        .send({
          connectee: "bailey.pearson@vanderbilt.edu",
          connector: "bananana@vanderbilt.edu"
        })
        .end((err, res) => {
          res.status.should.equal(404);
          res.body.error.should.equal(`users not found`);
          done();
        });
    });

    it("Failure - duplicate users", done => {
      primaryAgent
        .post(`${baseUrl}/connection`)
        .send({
          connectee: "bailey.pearson@vanderbilt.edu",
          connector: "bailey.pearson@vanderbilt.edu",
        })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(`cannot create connection to oneself`);
          done();
        });
    });

    it("Success - should create connection", done => {
      primaryAgent
        .post(`${baseUrl}/connection`)
        .send({
          connectee: "bailey.pearson@vanderbilt.edu",
          connector: "anjie.wang@vanderbilt.edu",
        })
        .end((err, res) => {
          res.status.should.equal(201);
          expect(res.body).to.have.own.property('status');
          res.body.status.should.equal('REQUESTING_TUTOR');
          expect(res.body).to.have.own.property('connector');
          res.body.connector.first_name.should.equal('anjie');
          res.body.connector.last_name.should.equal('wang');
          res.body.connector.phone.should.equal('6969696969');
          res.body.connector.email.should.equal('anjie.wang@vanderbilt.edu');
          expect(res.body).to.have.own.property('connectee');
          res.body.connectee.first_name.should.equal('bailey');
          res.body.connectee.last_name.should.equal('pearson');
          res.body.connectee.phone.should.equal('6969696969');
          res.body.connectee.email.should.equal('bailey.pearson@vanderbilt.edu');
          expect(res.body).to.have.own.property('_id');

          connection._id = res.body._id;
          done();
        });
    });

    it("Failure - cannot create the same connection twice", done => {
      primaryAgent
        .post(`${baseUrl}/connection`)
        .send({
          connectee: "bailey.pearson@vanderbilt.edu",
          connector: "anjie.wang@vanderbilt.edu",
        })
        .end((err, res) => {
          res.status.should.equal(400);
          done();
        });
    });
  });


  describe("Get connection:", () => {
    it("Failure - malformed object id", done => {
      primaryAgent
        .get(`${baseUrl}/connection/a1f23`)
        .end((err, res) => {
          res.status.should.equal(400);
          done();
        });
    });

    it("Failure - invalid object id", done => {
      primaryAgent
        .get(`${baseUrl}/connection/5c9561446e06572e3106b6ca`)
        .end((err, res) => {
          res.status.should.equal(404);
          done();
        });
    });

    it("Success - fetches object correctly", done => {
      primaryAgent
        .get(`${baseUrl}/connection/${connection._id}`)
        .end((err, res) => {
          res.status.should.equal(200);
          expect(res.body).to.have.own.property('status');
          res.body.status.should.equal('REQUESTING_TUTOR');
          expect(res.body).to.have.own.property('connector');
          res.body.connector.first_name.should.equal('anjie');
          res.body.connector.last_name.should.equal('wang');
          res.body.connector.phone.should.equal('6969696969');
          res.body.connector.email.should.equal('anjie.wang@vanderbilt.edu');
          expect(res.body).to.have.own.property('connectee');
          res.body.connectee.first_name.should.equal('bailey');
          res.body.connectee.last_name.should.equal('pearson');
          res.body.connectee.phone.should.equal('6969696969');
          res.body.connectee.email.should.equal('bailey.pearson@vanderbilt.edu');
          expect(res.body).to.have.own.property('_id');
          res.body._id.should.equal(connection._id);
          done();
        });
    });

  });

  describe("Get connection:", () => {
    it("Success - empty body returns 204 with malformed objectid", done => {
      primaryAgent
        .put(`${baseUrl}/connection/a1f23`)
        .end((err, res) => {
          res.status.should.equal(204);
          done();
        });
    });
    it("Success - empty body returns 204 with malformed objectid", done => {
      primaryAgent
        .put(`${baseUrl}/connection/5c9561446e06572e3106b6ca`)
        .end((err, res) => {
          res.status.should.equal(204);
          done();
        });
    });

    it("Success - non-empty body but no 'status'", done => {
      primaryAgent
        .put(`${baseUrl}/connection/5c9561446e06572e3106b6ca`)
        .send({
          bananas: '1234'
        })
        .end((err, res) => {
          res.status.should.equal(204);
          done();
        });
    });

    it("Failure - status contains invalid value", done => {
      primaryAgent
        .put(`${baseUrl}/connection/${connection._id}`)
        .send({
          status: '1234'
        })
        .end((err, res) => {
          res.status.should.equal(400);
          done();
        });
    });

    it("Success - should update object", done => {
      primaryAgent
        .put(`${baseUrl}/connection/${connection._id}`)
        .send({
          status: 'ACCEPTED'
        })
        .end((err, res) => {
          res.status.should.equal(200);
          expect(res.body).to.have.own.property('status');
          res.body.status.should.equal('ACCEPTED');
          expect(res.body).to.have.own.property('connector');
          res.body.connector.first_name.should.equal('anjie');
          res.body.connector.last_name.should.equal('wang');
          res.body.connector.phone.should.equal('6969696969');
          res.body.connector.email.should.equal('anjie.wang@vanderbilt.edu');
          expect(res.body).to.have.own.property('connectee');
          res.body.connectee.first_name.should.equal('bailey');
          res.body.connectee.last_name.should.equal('pearson');
          res.body.connectee.phone.should.equal('6969696969');
          res.body.connectee.email.should.equal('bailey.pearson@vanderbilt.edu');
          expect(res.body).to.have.own.property('_id');
          res.body._id.should.equal(connection._id);
          done();
        });
    });
  });


  describe("Delete connection:", () => {
    it("Failure - malformed object id", done => {
      primaryAgent
        .delete(`${baseUrl}/connection/a1f23`)
        .end((err, res) => {
          res.status.should.equal(400);
          done();
        });
    });

    it("Failure - non-existent object id", done => {
      primaryAgent
        .delete(`${baseUrl}/connection/5c9561446e06572e3106b6ca`)
        .end((err, res) => {
          res.status.should.equal(404);
          done();
        });
    });

    it("Failure - non-existent object id", done => {
      primaryAgent
        .delete(`${baseUrl}/connection/${connection._id}`)
        .end((err, res) => {
          res.status.should.equal(200);
          expect(res.body).to.have.own.property('status');
          res.body.status.should.equal('ACCEPTED');
          expect(res.body).to.have.own.property('connector');
          res.body.connector.first_name.should.equal('anjie');
          res.body.connector.last_name.should.equal('wang');
          res.body.connector.phone.should.equal('6969696969');
          res.body.connector.email.should.equal('anjie.wang@vanderbilt.edu');
          expect(res.body).to.have.own.property('connectee');
          res.body.connectee.first_name.should.equal('bailey');
          res.body.connectee.last_name.should.equal('pearson');
          res.body.connectee.phone.should.equal('6969696969');
          res.body.connectee.email.should.equal('bailey.pearson@vanderbilt.edu');
          expect(res.body).to.have.own.property('_id');
          res.body._id.should.equal(connection._id);
          done();
        });
    });

    it("Succeess - object should no longer be in database", done => {
      primaryAgent
        .get(`${baseUrl}/connection/${connection._id}`)
        .end((err, res) => {
          res.status.should.equal(404);
          done();
        });
    });


  });

});

