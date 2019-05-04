/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Fragment } from "react";
import PropTypes from "prop-types";

/*************************************************************************/

export const Logout = ({ history, logOut }) => {
	logOut();
	history.push("/");

	// components must return something, so we return a fragment
	return <Fragment />;
};

Logout.propTypes = {
  history: PropTypes.object.isRequired,
  logOut: PropTypes.func.isRequired
};
