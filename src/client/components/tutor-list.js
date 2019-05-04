import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import {
  CustomTable,Tbody,Td,Th,Thead,Tr,Tr_head,
  NotificationText, capitalizeFirstLetters
} from "./shared";

const Tutor = ({first_name,last_name,majors,avgRating,email,pushHistory}) => {
  return (
    <Tr onClick={pushHistory}>
      <Td>
        {first_name} {last_name}
      </Td>
      <Td>{majors}</Td>
      <Td>{avgRating===0 ? 'N/A' : avgRating.toFixed(1)}</Td>
    </Tr>
  );
};

export const TutorList = ({ resultList, history }) => {

  if (resultList===undefined || resultList.length===0 || resultList.length===undefined || resultList[0]===null) {
    return (
      <NotificationText>
        Sorry, no tutors found for current search keyword.
      </NotificationText>
    );
  } else {
      resultList = resultList.sort((a,b) => {
        let nameA = a.first_name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.first_name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      });
      //console.log('resultList: ',resultList);

      let tutorList = resultList.map((tutor,index)=>(
      <Tutor key={index}
            first_name={capitalizeFirstLetters(tutor.first_name)}
            last_name={capitalizeFirstLetters(tutor.last_name)}
            majors={capitalizeFirstLetters(tutor.majors[0])}
            avgRating={tutor.avgRating}
            email={tutor.email}
            pushHistory={() => history.push(`/profile/${tutor.email}`)}/>
    ));
    return (
      <CustomTable>
        <Thead>
          <Tr_head>
            <Th>Tutor Name</Th>
            <Th>Major</Th>
            <Th>Rating</Th>
          </Tr_head>
        </Thead>
        <Tbody>{tutorList}</Tbody>
      </CustomTable>
    );
  }
};