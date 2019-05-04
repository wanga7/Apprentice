/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Fragment } from "react";

import queryString from 'querystring-browser';

/*************************************************************************
*
*           simple react component used as redirect location
*               from SSO.  used to extract any data from the query
*               string in the redirect and store it to session storage
*               before redirecting to the /home route
*
**************************************************************************/

/*
 *  @param location: the location object associated with the browser router
 *  @param history: the history object associated with the browser router
 */
export const Login = ({ location, history, logIn }) => {
  const values = queryString.parse(location.search);
  // place the email in session storage for later use

  if (values.hasOwnProperty('email'))
    localStorage.setItem('email',values.email);
  else
    localStorage.setItem('email', values['?email']);
  // why does the querystring parse as ?email - what what what

  // create session in DB (user is logged in)
  logIn();

  history.push('/home');

  return <Fragment/>
};

