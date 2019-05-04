import React, { Component} from "react";
import { SidebarClassDisplay } from "./class-display";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { UserContext } from "./context/user-context";

let ImgSquareCrop=styled.img`
  grid-area: pic;
  text-align: center;
  object-fit: cover;
  width:300px;
  height:300px;
  margin: 8px;
	border-radius: '10px';
`;
let Item_info=styled.div`
  grid-area: info;
  margin-left: 12%;
  text-align: left;
`;
let Item_list1=styled.div`
  grid-area: list1;
  text-align: center;
`;
let Item_list2=styled.div`
  grid-area: list2;
  text-align: center;
`;
let Item_edit=styled.div`
  grid-area: edit;
  text-align: center;
`;

let GridContainer=styled.div`
  display: grid;
  grid-template-areas:
    'pic pic'
    'info info'
    'list1 list2'
    'edit edit';
  background: rgba(153, 153, 153, 0.2);
  grid-gap: 0px;
  padding: 5px;
  width: 320px;
  min-height: 748px;
  height: 100%;
`;


const infoDisplay = {
	display: 'flex',
	//width: '80%',
	padding: '0px',
};

const MyLink = styled(Link)`
	font-weight: bold;
	color: black;
	&:hover {
		cursor: pointer;
		text-decoration: underline;
		color: black;
	}
`;

const InfoDisplay = styled.p`
	padding-left: 8px;
	text-align: left;
	margin: 4px;
	width: 200px;
`;

export const SideBar = () => {
  return(
    <UserContext.Consumer>
      {
        ({user}) => {
          const tutoring = user.classes_tutor.map(item => item.course_id);
          const learning = user.classes_learn.map(item => item.course_id);

          return (<GridContainer>
            <ImgSquareCrop src={user.profileURL}/>
            <Item_info>
              <article style={infoDisplay}>
                <img src="/images/person.svg"/>
                <InfoDisplay> {user.first_name} {user.last_name} </InfoDisplay>
              </article>
              <article style={infoDisplay}>
                <img src="/images/school.svg"/>
                <InfoDisplay> {user.school} </InfoDisplay>
              </article>
              <article style={infoDisplay}>
                <img src="/images/book.svg"/>
                <InfoDisplay> {user.majors[0]} </InfoDisplay>
              </article>
              <article style={infoDisplay}>
                <img src="/images/blurb.svg"/>
                <InfoDisplay> {user.blurb} </InfoDisplay>
              </article>
            </Item_info>
            <Item_list1>
              <SidebarClassDisplay title="Tutoring" courses={tutoring}/>
            </Item_list1>
            <Item_list2>
              <SidebarClassDisplay title="Learning" courses={learning}/>
            </Item_list2>
            <Item_edit>
              <MyLink to={`/profile/${user.email}`}>
                Edit Profile
              </MyLink >
            </Item_edit>
          </GridContainer>
          );
        }
      }
    </UserContext.Consumer>
  )
};
