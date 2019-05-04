import React, { Component, Fragment } from "react";
import styled, { css } from "styled-components";
import { CustomTable, Tbody, Th, Thead, Tr } from "./shared";
import {ClassDisplay} from "./class-display";

const Box = styled.div`
	background: #dddddd;
	border-radius: 3px;
	width: 100%;
	height: 223px;
	// border: 1px solid BLACK;

	padding: 4px;
	margin: 8px;

	color: black;
	display: flex;
	flex-direction: column;
	position: relative;

	// make scrollable?
	overflow: auto;
`;

const ClassBox = styled.div`
	background: #dddddd;
	border-radius: 3px;
	padding: 4px;
	margin: 4px;
	border: 1px solid BLACK;

	display: flex;
	justify-content: space-between;

	// works in conjunction with overflow: auto in the Box element
	min-height: 40px;
`;

const XBox = ({ course_id,course_name,deleteFunc }) => {
  const Style = styled.div`
		padding: 4px;
		&:hover {
			cursor: pointer;
		}
		//font-size: 18px;
		width: 20%;
	`;
  return <Style onClick={deleteFunc}>
    <img id={course_id} name={course_name} src="/images/round-cancel.svg" />
  </Style>
};

const Course = ({ courseID,courseName, onDeleteCourse }) => {
  const Div = styled.div`
		padding: 4px;
		width: 85%;
		text-align: center;
	`;
  return <ClassBox>
    <Div> { courseID } </Div>
    <XBox course_id={courseID} course_name={courseName} deleteFunc={onDeleteCourse}/>
  </ClassBox>;
};

export const Cart = ({cart, onDeleteCourse}) => {
  const Div = styled.div`
    padding: 5px;
    font-weight: bold;
  `;

  return (
    <Box>
      <Div> Courses to add: </Div>
      {cart.map((course,index) => {
        return <Course key={index} courseID={course.course_id} courseName={course.course_name} onDeleteCourse={onDeleteCourse}/>
      })}
    </Box>
  );
};