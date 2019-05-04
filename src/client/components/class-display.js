import React, { Fragment } from "react";
import styled, { css } from "styled-components";

const Box = styled.div`
	background: #dddddd;
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.12);
	border-radius: 4px;
	min-width: 338px;
	height: 272.5px;
	//min-height: 250px;
	//max-height: 272.5px;

	padding: 4px;
	margin: 8px;

	color: #202020;
	display: flex;
	flex-direction: column;
	position: relative;

	// make scrollable?
	overflow-y: auto;
	overflow-x: auto;

	${props => !props.onProfile && css` 
		min-width: 140px
	`};
`;

const ClassBox = styled.div`
  background: #dddddd;
	// box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.12);
	border-radius: 3px;
	padding: 4px;
	margin: 4px;
	border: 1px solid #202020;

	display: flex;
	justify-content: space-between;

	// works in conjunction with overflow: auto in the Box element
	min-height: 45px;

`;

const XBox = ({ deleteFunc }) => {
  const Style = styled.div`
		margin-left: 4px;
		&:hover {
			cursor: pointer;
		}
		font-size: 18px;
		width: 5%;
	`;
  return <Style onClick={deleteFunc}> &times; </Style>;
};

const Course = ({ courseName, deleteFunc, showX = false }) => {
  const Div = styled.div`
		padding: 4px;
		width: 95%;
		text-align: center;
	`;
  return (
    <ClassBox>
      {showX ? <XBox deleteFunc={() => deleteFunc(courseName)}/> : <Fragment/>}
      <Div> {courseName} </Div>
    </ClassBox>
  );
};


const PlusButton = ({to,history}) => {
	const StyledImg = styled.img`
		width: 50px;
		position: fixed;
		margin-top: 215px;
    margin-left: 82px;
		&:hover {
	  	cursor: pointer;
		}
	`;

	return <StyledImg src="/images/plus_yellow_and_black.svg" onClick={() => {
    history.push(to);} } />;
};

export const ProfileClassDisplay = ({ onProfile, title, deleteFunc, courses = [], to, history }) => {
  if (!onProfile)
    return <SidebarClassDisplay title={title} courses={courses}/>;


  return (<Box>
    <div style={{ "textAlign": "center" }}> {title} </div>
    {
      courses.map((course, index) => {
        return <Course key={index} showX={true} courseName={course}
                       deleteFunc={deleteFunc}/>;
      })
    }
    <PlusButton to={to} history={history}/>
  </Box>);
};

export const SidebarClassDisplay = ({ title = "Courses", courses = [] }) => {
  return (<Box>
    <div style={{ "textAlign": "center" }}> {title} </div>
    {
      courses.map((course, index) => {
        return <Course key={index} courseName={course}/>;
      })
    }
  </Box>);
};

export const ClassDisplay = ({ onProfile, title = "Courses", courses = [], to, history }) => {
  return (<Box>
    <div style={{ "textAlign": "center" }}> {title} </div>
    {courses.map((course, index) => {
      return <Course key={index} courseName={course}/>;
    })}
    {onProfile ? <PlusButton to={to} history={history}/> : <Fragment/>}
  </Box>);
};
