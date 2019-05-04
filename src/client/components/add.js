import React, { Component, Fragment } from "react";
import { Link, withRouter }             from 'react-router-dom';
import { Button,Input } from './shared';
import styled from 'styled-components';

const defaultClass = () => {
  return { course_name: "", course_id: "" };
};

let Course_name=styled.div`grid-area: b;`;
let Course_id=styled.div`grid-area: a`;
let Input_course_name=styled.div`gird-area: d`;
let Input_course_id=styled.div`grid-area: c`;
let EditButton1=styled.div`grid-area: e`;
let EditButton2=styled.div`
  grid-area: f;
  `;

let GridContainer=styled.div`
  display: grid;
  grid-template-areas:
    'a b b'
    'c d e'
    '. . f';
   grid-gap: 5px 10px;
   background-color: white;
   padding: 10px;
`;

let Text=styled.div`
  font-weight: bold;
`;

let Style = styled.div`
  padding: 0px;
  //margin: 2px 2px;
  &:hover {
    cursor: pointer;
  }
`;

const RenderClass = ({course, onChange,index, remove, add, removeButton_flag, addButton_flag}) => {
  let handler = (index) => {
    return ev => {
      ev.target.index = index;
      onChange(ev);
    };
  };

  return (<GridContainer>
    <Course_id>
      <Text>Course ID:</Text>
    </Course_id>
    <Course_name>
      <Text>Course Name:</Text>
    </Course_name>
    <Input_course_id>
      <Input type="text" name="course_id" value={course.course_id} onChange={handler(index)}/>
    </Input_course_id>
    <Input_course_name>
      <Input type="text" name="course_name" value={course.course_name} onChange={handler(index)}/>
    </Input_course_name>
    <EditButton1>
      {removeButton_flag ? (
        <Style onClick={() => {remove(index)}}>
          <img src="/images/round-remove_circle_outline-24px.svg" />
        </Style>
        ) : (
          <Style onClick={add}>
            <img src="/images/round-add_circle_outline-24px.svg" />
          </Style>
        )
      }
    </EditButton1>
    <EditButton2>
      {(addButton_flag && removeButton_flag) ? (
        <Style onClick={add}>
          <img src="/images/round-add_circle_outline-24px.svg" />
        </Style>
      ) : <div/>
      }
    </EditButton2>
  </GridContainer>);
};

let centerDivStyle = {
  margin: '16 auto',
  padding: '8'
  //width: '95%'
};

let Aligned={
  textAlign: 'left'
};

export class Add extends Component {
  constructor(props) {
    super(props);

    this.state = {
      classes: [ defaultClass() ],
      //username: this.props.username
    };

    this.onChange = this.onChange.bind(this);
    this.addNewClass = this.addNewClass.bind(this);
    this.submit = this.submit.bind(this);
  }

  onChange(ev) {
    let state = this.state.classes.slice();
    state[ev.target.index][ev.target.name] = ev.target.value;
    this.setState( { classes: state });
  }

  addNewClass() {
    let classes = this.state.classes.slice();
    classes.push(defaultClass());
    this.setState( {
      classes: classes
    });
  }

  async submit() {
    console.log("submit classes:",this.state.classes);

    await fetch(`/v1/class`, {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(
        this.state.classes
      )
    });

    this.props.handleModalDisplay();
  }

  remove(index) {
    let state = this.state.classes.slice(0,index).concat(this.state.classes.slice(index+1));
    if (state.length===0) {state=[defaultClass()];}
    this.setState( { classes: state });
  }

  render() {
    let classes = this.state.classes.map((course, index) => {
      return <RenderClass
        onChange={this.onChange}
        course={course}
        index={ index }
        key={index}
        remove={this.remove.bind(this)}
        add={this.addNewClass}
        removeButton_flag={this.state.classes.length>1}
        addButton_flag={index===this.state.classes.length-1}
      />;
    });
    return (
      <div style={centerDivStyle}>
        <div>{classes}</div>
        <div style={Aligned}>
          {/*<Button onClick={this.addNewClass}> Add another course </Button>*/}
          {/*<Link to={`/profile/${sessionStorage.getItem('email')}`}>*/}
            <Button onClick={this.submit}> Submit </Button>
          {/*</Link>*/}
        </div>
      </div>
    )
  }
}

