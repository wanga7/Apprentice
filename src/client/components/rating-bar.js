import React, { Component, Fragment }             from 'react';
import styled from 'styled-components';

const StyledStar = styled.img`
		width: 50px;
		margin: 0px;
		&:hover {
	  	cursor: pointer;
		}
	`;
const StyledStar_Static = styled.img`
    width: 50px;
		margin: 0px;
`;
const Div=styled.div`
    text-align: center;
`;

export class RatingBar extends Component {
  constructor(props) {
    super(props);
    this.state={
      editable: this.props.editable,
      rating: this.props.rating,
      tempRating: this.props.rating,
    };
    this.starSet=this.starSet.bind(this);
    this.starOver=this.starOver.bind(this);
    this.starOut=this.starOut.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.editable && props.rating!==state.rating) {
      //console.log('getDerivedStateFromProps - props:',props);
      return {
        rating: props.rating,
      };
    } else if (state.editable && props.rating!==state.rating) {
      return {
        rating: props.rating,
        tempRating: props.rating
      }
    }
    return null;
  }

  starSet(index) {
    this.setState({rating: index, tempRating: index});
    this.props.updateBarRating(index);
  }
  starOver(index) {
    this.setState({tempRating: index})
  }
  starOut() {
    this.setState({tempRating: this.state.rating})
  }

  render() {
    let stars=[];
    for (let i=1;i<=5;i++) {

      if (this.state.editable) {
        let starType=i<=this.state.tempRating
          ? '/images/vanderbilt_yellow.svg'
          : '/images/vanderbilt_grey.svg';
        stars.push(
          <StyledStar
            key={i}
            src={starType}
            onClick={this.starSet.bind(this,i)}
            onMouseOver={this.starOver.bind(this,i)}
            onMouseOut={this.starOut}
          />
        )
      } else {
        let starType=i<=this.state.rating
          ? '/images/vanderbilt_yellow.svg'
          : '/images/vanderbilt_grey.svg';
        stars.push(
          <StyledStar_Static
            key={i}
            src={starType}
          />
        )
      }

    }
    return <Div>{stars}</Div>
  }
}