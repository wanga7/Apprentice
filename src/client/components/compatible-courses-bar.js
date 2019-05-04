import React, { Component, Fragment }             from 'react';
import styled from 'styled-components';
import { UserContext } from "./context/user-context";

let BoldNumber=styled.div`
  font-weight: bolder;
  font-size: large;
  display: inline-block;
`;

export class CompatibleCoursesBar extends Component {
  constructor(props) {
    super(props);
    this.intersect=this.intersect.bind(this);
  }

  intersect(arr1,arr2) {
    return arr1.filter(Set.prototype.has, new Set(arr2)).length;
  }

  render() {
    return (
      <UserContext.Consumer>
        {
          ({user}) => {
            let learning = user.classes_learn.map(item => item.course_id);
            let value1=this.intersect(learning, this.props.tutor_tutoring);
            let value2=this.intersect(learning, this.props.tutor_learning);
            //console.log('value1,2: ',value1, value2);

            return (
              <div>
                <div><BoldNumber>{this.props.tutor_name}</BoldNumber> can tutor you in <BoldNumber>{value1}</BoldNumber> courses.</div>
                <div>You two are learning <BoldNumber>{value2}</BoldNumber> courses in common.</div>
              </div>
            )
          }
        }
      </UserContext.Consumer>
    );
  }
}