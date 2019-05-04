import React, { Fragment } from "react";
import Cookies from "js-cookie";

import { Redirect, Route } from "react-router-dom";

export const getAccessToken = () => localStorage.getItem("email");
export const getRefreshToken = () => Cookies.get("refresh_token");
export const isAuthenticated = () => !!getAccessToken();

export const clearUserData = () => {
  localStorage.removeItem("email");
  Cookies.remove("session");
};

export const PrivateRoute = ({ render, ...rest }) => {
  return <Route {...rest} render={props => {
    if (isAuthenticated())
      return render(props);

    // be sure there are no logging in issues
    clearUserData();
    
    return <Redirect to={{
      pathname: "/",
      state: {
        from: props.location
      }
    }}
    />
  }}
  />;
};
