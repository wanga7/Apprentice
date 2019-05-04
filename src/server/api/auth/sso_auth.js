/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

const request = require("request");

const querystring = require("querystring");

// github secret information, needs to be filled in before 
// using sso but for security I don't want to put it on Github

const ghConfig = {
  client_id: process.env.NODE_ENV ? process.env.GITHUB_CLIENT_ID : process.env.GITHUB_CLIENT_ID_DEV, 
  client_secret: process.env.NODE_ENV ? process.env.GITHUB_SECRET_ID : process.env.GITHUB_CLIENT_SECRET_DEV,
  scope: "read:user"
};

/********************************************************************************
 *
 *        helpers to make the github sso work
 *
 ********************************************************************************/
const checkState = (goodState, state) => {
  return new Promise((resolve, reject) => {
    if (goodState !== state) {
      reject({
        error:
          "Invalid state - Log out and in again before linking with Github."
      });
    } else resolve();
  });
};

const checkCode = code => {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `https://github.com/login/oauth/access_token`,
        headers: {
          "User-Agent": "request",
          Accept: "application/json"
        },
        formData: {
          client_id: ghConfig.client_id,
          client_secret: ghConfig.client_secret,
          code: code
        }
      },
      (err, res, body) => {
        if (err) reject(err);
        if (body.error) reject(body);
        else resolve(JSON.parse(body));
      }
    );
  });
};

const checkGithubInfo = accessToken => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: "https://api.github.com/user",
        headers: {
          "User-Agent": "request",
          Authorization: `token ${accessToken}`
        }
      },
      (err, res, body) => {
        if (err) reject(err);
        else resolve(JSON.parse(body));
      }
    );
  });
};

const getUser = (username, accessToken) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/users/${username}`;
    request.get(
      {
        url: url,
        headers: {
          "User-Agent": "request",
          Authorization: `token ${accessToken}`
        }
      },
      (err, res, body) => {
        if (err) reject(err);
        else {
          let obj = JSON.parse(body);
          obj = {
            email: obj.email,
            username: obj.login,
            profile_picture: obj.avatar_url
          };

          resolve(obj);
        }
      }
    );
  });
};

module.exports = app => {

  // Any attempt to login redirects to Github SSO auth
  app.get("/v1/auth/login", (req, res) => {
    if (req.session.user)
      return res.redirect('/home');
    // Redirect to Github login with client_id, state and scope
    req.session.state = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substr(0, 10);
    const ghPath =
      `https://github.com/login/oauth/authorize?` +
      `scope=${ghConfig.scope}&` +
      `client_id=${ghConfig.client_id}&` +
      `state=${req.session.state}`;
    res.redirect(ghPath);
  });

  // authorization callback
  app.get("/auth/github", async (req, res) => {
    // Must have a temp code from GH
    if (!req.query.code)
      return res.status(400).send({ error: "Code field required" });
    // Must have state token too
    if (!req.query.state)
      return res.status(400).send({ error: "State field required" });
    // Validate state
    try {
      // Is this a valid GH response
      await checkState(req.session.state, req.query.state);

      // Convert code to token and scope
      const { access_token } = await checkCode(req.query.code);

      // Get GH username
      const { login } = await checkGithubInfo(access_token);

      // we good, auth is okay.  time to get user info and see if
      // 	we need to create the user
      const userInfo = await getUser(
        login,
        access_token,
      );


      const query = app.models.User.findOne({ email: userInfo.email })
        .populate("classes_learn", "course_id course_name -_id")
        .populate("classes_tutor", "course_id course_name -_id");
        
      // query for the user in the database to see if they're already there
      let user = await query.exec(); 
      if (!user) {
        // redirect to /register page to register the user
        const queryParams = querystring.stringify({
          profile_picture: userInfo.profile_picture
        });

        // redirect user to login page
        return res.redirect(`/register/${userInfo.email}?${queryParams}`);
      }
      
      // Save the login and token to the session for future use
      req.session.user = { login: login, token: access_token };

      const ret = {
        majors: user.majors,
        minors: user.minors,
        interests: user.interests,
        classes_learn: user.classes_learn,
        classes_tutor: user.classes_tutor,
        // rating: user.rating,
        avgRating: user.avgRating,
        first_name: user.first_name,
        last_name: user.last_name,
        school: user.school,
        profile_picture: user.profile_picture,
        graduation_year: user.graduation_year,
        phone: user.phone,
        blurb: user.blurb,
        email: user.email
      };

      // redirect user to login page
      const params = querystring.stringify(ret);
      res.redirect(`/login?${params}`);

    } catch (err) {
      console.log(err);
      // Send user to error page explaining what happened
      res.status(400).send(err);
    }
  });

};
