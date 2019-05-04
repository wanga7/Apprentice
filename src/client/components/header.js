/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Component, Fragment } from "react";

import { UserContext } from "./context/user-context";

import { capitalizeName } from "./shared";

/* 
 *  makes use of styled components - idk if we want to use them, but I like them
 *  for smaller things
 */
import styled from "styled-components";

const generalStyle = {
  fontFamily: "Roboto Mono",
  color: "#202020",
  fontStyle: "italic",
  fontWeight: "bold",
  lineHeight: "normal",
  fontSize: "20px"
};

let HeaderBar = styled.nav`
    background-color: #FFD874;
    //padding: 20px 0;
    display: flex;
    justify-content: space-between;
    //padding: 5px;
    align-items: center;
  height: 100%;
	min-height: 76px;
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const Divider = styled.div`
	width: 0px;
	min-height: 76px;
	left: 1406px;
	top: 24px;

	border: 1px solid rgba(0, 0, 0, 0.12);

	margin-left: 16px;
	margin-right: 16px;
`;

let Logo = styled.div`
	font-family: Roboto Mono;
	color: #202020;
	margin: 8px;
	padding-left: 10px;
	font-weight: bold;

	&:hover {
		cursor: pointer;
	}

	font-style: italic;
	font-weight: bold;
	line-height: normal;
	font-size: 30px;
	text-align: center;

`;

let NavLink = styled.div`
	color: #202020;
	font-size: 20px;
	width: 54px;
	&:hover {
		color: grey;
		cursor: pointer;
	}

	width: 54px;
	height: 44px;

	font-family: Roboto Mono;
	font-style: italic;
	font-weight: bold;
	line-height: normal;
	font-size: 20px;
	text-align: center;
`;

let Div = styled.div`
  display : flex;
  align-items: center;
  margin: 5px;
  margin-left: 10px;
  margin-right: 10px;
`;

let BigButton = styled.button`
  background-color: transparent;
  border-style: solid;
  border-color: #202020;
  border-width: 2px;
  color: #202020;
  padding: 5px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 20px;
  font-weight: lighter;
  font-family: Roboto Mono;
  margin: 2px 15px;
  border-radius: 4px;
  
  &:hover {
	  cursor: pointer;
	  background-color: #202020;
	  color: #FFD874;
	}
	-webkit-transition-duration: 0.4s; //safari
	transition-duration: 0.4s;
	
	&:focus {
		outline: none;
	}
`;


const LoggedInHeader = ({history,name}) => {
  return (
    <HeaderBar>
      <Logo onClick={() => history.push("/home")}> Apprentice </Logo>
      <Div style={{ "paddingRight": "8px" }}>
        <div style={generalStyle}> Welcome, {name}!</div>
        <BigButton onClick={() => history.push("/logout")}>Log Out</BigButton>
      </Div>
    </HeaderBar>
  );
};

const NotLoggedInHeader = ({history}) => {
  return (
    <HeaderBar>
      <Logo onClick={() => history.push("/home")}> Apprentice </Logo>
    </HeaderBar>
  );
};


export const Header = ({history}) => {
  return(
    <UserContext.Consumer>
      {
        ({user,loggedIn,active}) => {
          //console.log(active);
          if (active && loggedIn())
            return <LoggedInHeader name={user.first_name} history={history}/>;
          return <NotLoggedInHeader history={history}/>;
        }
      }
    </UserContext.Consumer>
  )
};

// class Header1 extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       user: {},
//       loggedIn: false
//     };
//   }
//
//   async componentDidMount() {
//     // this method spews errors rn but once the user state is stored globally, no need for fetch => problem solved
//     let user = await fetch(`/v1/user/${sessionStorage.getItem("email")}`);
//     user = await user.json();
//
//     this.setState({
//       user: user,
//       loggedIn: true
//     });
//   }
//
//   render() {
//     if (this.state.loggedIn)
//           return <LoggedInHeader name={this.state.user.first_name} history={this.props.history}/>;
//     return <NotLoggedInHeader history={this.props.history}/>;
//   }
// }
