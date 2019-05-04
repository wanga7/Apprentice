/* Copyright G. Hemingway @2018 - All rights reserved */
"use strict";

module.exports = app => {
	require("./v1/user")(app);
	require("./v1/class")(app);
	require("./v1/session")(app);
	require('./auth/sso_auth')(app);
	require('./auth/vandy_sso')(app);

	require('./v1/connection')(app);
	require('./v1/rating')(app);
};
