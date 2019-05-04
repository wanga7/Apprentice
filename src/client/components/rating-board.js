import React, { Component, Fragment }             from 'react';
import styled from 'styled-components';
import {RatingBar} from "./rating-bar";

let Title=styled.div`
  grid-area: title;
  text-align: left;
  font-weight: bolder;
  margin-left: 10px;
`;
let Rating=styled.div`
  grid-area: rating;
  text-align: center;
  font-weight: bolder;
  font-size: 40px;
`;
let Star=styled.div`
  grid-area: star;
  text-align: center;
`;
let People=styled.div`
  margin-top: 10px;
  grid-area: people;
  text-align: center;
`;

let GridContainer=styled.div`
  display: grid;
  grid-template-areas:
    'title'
    'rating'
    'star'
    'people';
  background: #dddddd;
  grid-gap: 0px;
  padding: 4px;
	margin: 8px;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.12);
	border-radius: 4px;
	text-color: #202020;
`;

let StyledImg=styled.img`
  border-radius: 10px;
  display: inline-block;
  margin-right: 4px;
`;
let PeopleText=styled.div`
  display: inline-block;
`;

export class RatingBoard extends Component {
  constructor(props) {
    super(props);
    //console.log('RatingBoard - this.props:',this.props);
    this.state={
      tutorEmail: this.props.tutorEmail,
      avgRating: 0,
      numOfRatings: 0
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.tutorEmail!==state.tutorEmail) {
      //console.log('getDerivedStateFromProps - props:',props);
      return {
        tutorEmail: props.tutorEmail,
      };
    }
    return null;
  }

  async componentDidMount() {
    try {
      //console.log('componentDidMount()');
      if (this.state.tutorEmail!=='') {
        //console.log('RatingBoard - this.state:',this.state);
        let data = await (await fetch(`/v1/rating/${this.props.tutorEmail}`)).json();
        //console.log('RatingBoard - data:',data);
        await this.setState(data);
        //console.log('this.state:',this.state);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async componentDidUpdate(prevProps, prevState, prevContext) {
    if (this.props.tutorEmail!==prevProps.tutorEmail) {
      //console.log('componentDidUpdate - this.state: ',this.state);
      try {
        if (this.state.tutorEmail!=='') {
          //console.log('RatingBoard - this.state:',this.state);
          let data = await (await fetch(`/v1/rating/${this.props.tutorEmail}`)).json();
          //console.log('RatingBoard - data:',data);
          await this.setState(data);
          //console.log('this.state:',this.state);
        }
      } catch (err) {
        console.error(err);
      }
    }

  }

  render() {
    return (
      <GridContainer>
        <Title>
          Average Rating:
        </Title>
        <Rating>
          {this.state.avgRating===0
            ? 'N/A'
            : this.state.avgRating.toFixed(1)}
        </Rating>
        <Star>
          <RatingBar editable={false} rating={Math.floor(this.state.avgRating)}/>
        </Star>
        <People>
          <StyledImg src={"/images/person.svg"}/>
          <PeopleText>{this.state.numOfRatings} total</PeopleText>
        </People>
      </GridContainer>
    )
  }
}