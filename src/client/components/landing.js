import React, { Component, Fragment } from "react";

import styled from "styled-components";

let Upper=styled.div`
  grid-area: u;
  text-align: center;
  margin: auto;
`;

let Lower=styled.div`
  grid-area: l;
  text-align: center;
  vertical-align: middle;
`;

let GridContainer=styled.div`
  display: grid;
  grid-template-areas:
    '.'
    '.'
    'u'
    'l'
    '.'
    '.';
  background-color: #FFD874;
  width: 100%;
  min-height: 100%; 
`;

let Title=styled.div`
  font-family: Roboto Mono;
	color: #202020;
	font-style: italic;
	font-weight: bolder;
	font-size: 80px;
	text-align: center;
	margin-bottom: 25px;
`;

let Subtitle=styled.div`
  color: #202020;
  font-size: 25px;
  font-weight: lighter;
  font-family: Roboto Mono;
`;

let ButtonArea = styled.div`
  text-align: center;
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
  font-size: 30px;
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

export class Landing extends Component {
    constructor(props) {
        super(props);

        if (this.props.loggedIn())
            return this.props.history.push('/home');
    }

    async login() {
        if (this.props.loggedIn()) {
          return this.props.history.push(`/home`);
        }

        // guess you're not logged in
        document.location = "/v1/auth/login";
    }
    
    render(){
      return (
        <GridContainer>
          <Upper>
            <Title>
              Apprentice
            </Title>
            <Subtitle>
              A place to connect tutors and students.
            </Subtitle>
          </Upper>
          <Lower>
            <ButtonArea style={{ "paddingRight" : "8px"}}>
              <BigButton onClick={this.login.bind(this)}> Log In </BigButton>
              <BigButton onClick={this.login.bind(this)}> Register </BigButton>
            </ButtonArea>
          </Lower>
        </GridContainer>
      );
    }
}
