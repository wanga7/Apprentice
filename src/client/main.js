/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

// Necessary modules
import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";

import { Auth } from "./components/auth";
import { Home } from "./components/home";
import { Landing } from "./components/landing";
import { Logout } from "./components/logout";
import { FixedProfile } from "./components/fixed-profile";
import { EditableProfile } from "./components/editable-profile";
import { Search } from "./components/search";
import { EditCourse } from "./components/editCourse";
import { Login } from "./components/login";
import { Register } from "./components/register-profile";

import { AuthenticationWrapper, PrivateRoute, clearUserData } from "./components/higher-order-components/logged-in";

import { UserContext } from "./components/context/user-context";
import { Dummy } from "./components/dummy";
import { getProfilePicture } from "./components/shared";

const defaultUser = {
  first_name: "",
  last_name: "",
  school: "",
  profile_picture: false,
  majors: [],
  minors: [],
  graduation_year: 2019,
  interests: [],
  phone: "",
  email: "",
  blurb: "",
  avgRating: [],
  classes_tutor: [],
  classes_learn: []
};


/*************************************************************************/
class MyApp extends Component {
  constructor(props) {
    super(props);

    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
    this.updateTutoring = this.updateTutoring.bind(this);
    this.updateLearning = this.updateLearning.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.loggedIn = this.loggedIn.bind(this);

    this.state = {
      user: defaultUser,
      loggedIn: this.loggedIn,
      updateUser: this.updateUser,
      active: false
    };

    console.log('component created');
  }

  loggedIn() {
    return localStorage.getItem("email") !== null;
  }

  async logIn() {
    let body = JSON.stringify({
      email: localStorage.getItem('email'),
    });

    await fetch('/v1/session',{
      method: "POST",
      body: body,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setState({ active: true });
  }

  componentDidMount() {
    // console.log(this.props);
    // // gotta log in if you are not logged in
    if (!this.loggedIn())
      return;
    fetch(`/v1/user/${localStorage.getItem('email')}`)
      .then(res => res.json())
      .then(async res => {
        this.updateUser(res);
        // this.logIn();
        this.setState({
          active: true,
        })
        console.log(this.state.user.profile_picture);

        getProfilePicture(this.state.user.profile_picture, this.state.user.email)
          .then(profileURL=>{
            let newUser = this.state.user;
            newUser.profileURL = profileURL;
            this.updateUser({user: newUser});
          }).catch(err=>console.log(err));
      });
  }

  async logOut() {
    await fetch('/v1/session',{
      method: 'DELETE'
    });
    clearUserData();
    this.setState({
      active: false,
    });
  }

  /**
   *  updateUser
   *  @param newUser - dictionary containing the new user fields (could contain all of them)
   *  @return promise
   */
  async updateUser(newUser) {
    await this.setState({ user: { ...this.state.user, ...newUser } });
  }

  updateTutoring(newCourses) {
    let user = JSON.parse(JSON.stringify(this.state.user));
    user.classes_tutor = Array.from(new Set(user.classes_tutor.concat(newCourses)));
    this.setState({ user: user });
    this.updateUser();
  }

  updateLearning(newCourses) {
    let user = JSON.parse(JSON.stringify(this.state.user));
    user.classes_learn = Array.from(new Set(user.classes_learn.concat(newCourses)));
    this.setState({ user: user });
    this.updateUser();
  }

  render() {
    return (
      <UserContext.Provider value={this.state}>
        <BrowserRouter>
          <Fragment>
            {/********************************************************************
             *              Landing
             *********************************************************************/}
            <Route
              exact path='/'
              render={props =>
                <Landing {...props} logIn={this.logIn}
                         loggedIn={this.loggedIn}/>
              }
            />

            {/********************************************************************
             *              Home Page
             *********************************************************************/}
              <PrivateRoute
                exact path='/home'
                render={props => <Home {...props} {...this.state}/>}
              />

            {/********************************************************************
             *              profile page
             *********************************************************************/}
            <PrivateRoute
              path='/profile/:username'
              render={props => {
                  if (props.match.params.username !== localStorage.getItem('email'))
                    return <FixedProfile {...props} {...this.state} />;
                  return <EditableProfile {...props} {...this.state}/>;
                }
              }
            />

            {/********************************************************************
             *              register page
             *********************************************************************/}
            <Route
              path='/register/:username'
              render={props =>
                <Register {...props} {...this.state}/>
              }
            />

            <PrivateRoute
              path='/search/'
              render={props =>
                <Search {...props}/>
              }
            />

            <PrivateRoute
              path='/editcourses/:type(tutoring|learning)'
              render={props =>
                <EditCourse {...props} {...this.state}
                            updateTutoring={this.updateTutoring}
                            updateLearning={this.updateLearning}/>
              }
            />

            <PrivateRoute
              path='/logout'
              render={props =>
                <Logout {...props} logOut={this.logOut}/>
              }

            />

            <Route
              path='/login'
              render={
                props => <Login {...props}
                                logIn={this.logIn}/>
              }
            />

            <PrivateRoute
              path='/dev'
              render={
                props => <Dummy/>
              }
            />
          </Fragment>
        </BrowserRouter>
      </UserContext.Provider>
    );
  }
}

render(<MyApp/>, document.getElementById("mainDiv"));
