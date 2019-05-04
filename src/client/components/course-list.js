import React, { Component, Fragment } from "react";
import styled from 'styled-components'
import {
  Button,
  CustomTable, Tbody, Td, Th, Thead, Tr,
  NotificationText, NotificationLinkText,
  capitalizeFirstLetters, formattingCourseID
} from "./shared";


const XBox = ({ course_id,addFunc,course_name }) => {
  const Style = styled.div`
		padding: 4px;
		&:hover {
			cursor: pointer;
		}
		//font-size: 18px;
		width: 20%;
	`;
  return <Style onClick={addFunc} id={course_id} name={course_name}>
    <img id={course_id} name={course_name} src="/images/plus-circle.svg" />
  </Style>
};

const Course = ({course_id, course_name, checked, onAddCourse}) => {
  return (
    <Tr>
      <Td>{course_id}</Td>
      <Td>{capitalizeFirstLetters(course_name)}</Td>
      <Td>
        <XBox course_id={course_id} course_name={course_name} addFunc={onAddCourse}/>
      </Td>
    </Tr>
  );
};

export const CourseList = ({resultList, onAddCourse, handleModalDisplay}) => {
  if (resultList===undefined || resultList.length===0 || resultList.length===undefined) {
    return (
      <div>
        <NotificationText>Sorry, no courses found for current search keyword.</NotificationText>
        <NotificationLinkText onClick={handleModalDisplay}>
          The course you want is not in the system? Click here
        </NotificationLinkText>
      </div>
    );
  } else {
    resultList = resultList.sort((a,b) => {
      let nameA = a.course_id.toUpperCase(); // ignore upper and lowercase
      let nameB = b.course_id.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
    let courseList = resultList.map((course,index)=>(
      <Course key={index}
              course_id={course.course_id}
              course_name={course.course_name}
              checked={course.checked}
              onAddCourse={onAddCourse}/>
    ));

    return (
      <CustomTable>
        <Thead>
        {/*<Tr>*/}
          {/*<Th>Course ID</Th>*/}
          {/*<Th>Course Name</Th>*/}
          {/*<Th>Add Course</Th>*/}
        {/*</Tr>*/}
        </Thead>
        <Tbody>{courseList}</Tbody>
      </CustomTable>
    );
  }
};
