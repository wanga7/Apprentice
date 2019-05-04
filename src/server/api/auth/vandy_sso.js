/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

const fs = require("fs");
const saml2 = require("saml2-js");

/**********************************************************************************************************************/

/*
 * Via: GET /metadata.xml
 * Access: Anyone can request
 */
const metadata = sp => (req, res) => {
  const metadata = sp.create_metadata();
  res.append("content-type", "application/xml");
  res.status(200).end(metadata);
};

/*
 * Via: GET /login
 * Access: Anyone can request
 */
const login = (app, sp, idp) => async (req, res) => {
  try {
    // Validate token - redirect to /status if present
    // await app.validateToken(req.cookies);
    // res.redirect("/status");
  } catch (err) {
    // Generate the new login request via SSO and redirect
    sp.create_login_request_url(idp, {}, (err, login_url) => {
      res.redirect(login_url);
    });
  }
};

/*
 * Via: POST /auth/vandy
 * Access: Anyone can request
 */
const postauth = (app, sp, idp) => async (req, res) => {
  try {
    // If there is already a token, redirect to /status
    // await app.validateToken(req.cookies);
    // res.redirect("/status");
  } catch (err) {
    // Get SAML post assert data
    let options = { request_body: req.body };
    sp.post_assert(idp, options, async (err, saml_response) => {
      if (err) {
        console.log(err);
        return res.status(400).send({ error: "Vandy SSO error" });
      }
      // Capture SSO user details
      const attributes = saml_response.user.attributes;
      let data = {
        nameId: saml_response.user.name_id,
        sessionId: saml_response.user.session_index
      };
      if (process.env.NODE_ENV === "dev") {
        data.vunetid = attributes.username[0];
        data.email = attributes.email[0];
      } else {
        data.vunetid = attributes[
          "urn:oid:0.9.2342.19200300.100.1.1"
        ][0].toLowerCase();
        data.email = attributes[
          "urn:oid:0.9.2342.19200300.100.1.3"
        ][0].toLowerCase();
        data.name = attributes["urn:oid:2.16.840.1.113730.3.1.241"][0];
      }
      // Update Users table - may create new document
      try {
        let caller = await app.models.User.findOneAndUpdate(
          { vunetid: data.vunetid },
          data,
          {
            upsert: true,
            new: true
          }
        );
        // Record a login event
        let login = new app.models.Login({
          user: caller._id,
          ip: req.ip
        });
        await login.save();
        // Generate JWT to show they are authenticated
        let token = jwt.sign({ vunetid: data.vunetid }, app.certs.private_key, {
          expiresIn: "1 day",
          algorithm: "RS256"
        });
        res.set("Set-Cookie", `${app.conf.tokenName}=${token}; Path=/;`);
        res.redirect("/status");
      } catch (err) {
        console.log(err);
        res.status(400).end();
      }
    });
  }
};

/*
 * Via: GET /logout
 * Access: Anyone can request
 */
const logout = (app, sp, idp) => async (req, res) => {
  try {
    // If there is already a token, redirect to /status
    let caller = await app.validateToken(req.cookies, true);
    // Pass to SAML for logout at SSO
    let options = {
      name_id: caller.nameId,
      session_index: caller.sessionId
    };
    sp.create_logout_request_url(idp, options, (err, logout_url) => {
      res.set(
        "Set-Cookie",
        `${app.conf.tokenName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      );
      res.redirect(logout_url);
    });
  } catch (err) {
    console.log(err);
    res.set(
      "Set-Cookie",
      `${app.conf.tokenName}=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    );
    res.redirect("/");
  }
};

/*
 * Via: GET /auth/vandy
 * Access: Anyone can request
 * Implies that user just signed out of Vandy SSO - redirect to landing
 */
const postlogout = (req, res) => {
  res.redirect("/");
};

module.exports = app => {
  const sp_options = {
    entity_id: `${app.conf.base_url}/metadata.xml`,
    private_key: app.conf.certs.private_key,
    certificate: app.conf.certs.rl_cert,
    assert_endpoint: `${app.conf.base_url}/auth/vanderbilt`,
    force_authn: true,
    auth_context: {
      comparison: "exact",
      class_refs: ["urn:oasis:names:tc:SAML:1.0:am:password"]
    },
    sign_get_request: true,
    allow_unencrypted_assertion: false
  };
  // Call service provider constructor with options
  const sp = new saml2.ServiceProvider(sp_options);

  // Dev Identify provider
  const dev_idp = {
    sso_login_url: "https://localhost:7443/simplesaml/saml2/idp/SSOService.php",
    sso_logout_url:
      "https://localhost:7443/simplesaml/saml2/idp/SingleLogoutService.php",
    certificates: [
      fs.readFileSync(`./config/vandy.crt`).toString()
    ],
    force_authn: true,
    sign_get_request: true,
    allow_unencrypted_assertion: true // This can't be false for Dev IdP
  };

  // Create identity provider
  const vandyUAT_idp = {
    sso_login_url: "https://sso-login-uat.vanderbilt.edu/idp/startSSO.ping?PartnerSpId=https%3A%2F%2Fvanderbilt.rosterlink.org%2Fmetadata.xml",
    sso_logout_url: "https://sso-login-uat.vanderbilt.edu/ext/vu_logout",
    certificates: [
      fs.readFileSync(`./config/vandy.crt`).toString()
    ],
    force_authn: true,
    sign_get_request: true,
    allow_unencrypted_assertion: true
  };

  const vandyProd_idp = {
    sso_login_url: "https://sso-login.vanderbilt.edu/idp/startSSO.ping?PartnerSpId=https%3A%2F%2Fvanderbilt.rosterlink.org%2Fmetadata.xml",
    sso_logout_url: "https://sso-login.vanderbilt.edu/ext/vu_logout",
    certificates: [
      fs.readFileSync(`./config/vandy.crt`).toString()
    ],
    force_authn: true,
    sign_get_request: true,
    allow_unencrypted_assertion: true
  };

  let idp;
  switch (process.env.NODE_ENV) {
    case "dev":
      idp = new saml2.IdentityProvider(dev_idp);
      break;
    case "uat":
      idp = new saml2.IdentityProvider(vandyUAT_idp);
      break;
    case "production":
      idp = new saml2.IdentityProvider(vandyProd_idp);
      break;
  }

  // app.get("/metadata.xml", metadata(sp));
  // app.get("/login", login(app, sp, idp));
  // app.post("/auth/vanderbilt", postauth(app, sp, idp));
  // app.get("/logout", logout(app, sp, idp));
  // app.get("/auth/vanderbilt", postlogout);
};
