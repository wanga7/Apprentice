"use strict";

import React from "react";
import styled from "styled-components";

export const NotificationText = styled.div`
  padding-left: 8px;
  padding-right: 8px;
  margin-left: 16px;
  margin-right: 16px;
  font-weight: bold;
`;

export const NotificationLinkText = styled.div`
  padding-left: 8px;
  padding-right: 8px;
  margin-left: 16px;
  margin-right: 16px;
  color: #36474F;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

/*
Search Result Table Styles
 */
export const CustomTable = styled.table`
  width: 100%;
  background-color: #EEEEEE;
  padding: 8px;
	margin: 16px;
	border-radius: 4px;
`;

export const Thead = styled.thead`
  display: flex;
  flex-direction: column;
  tr {
    cursor: initial;
    &:hover {
      background: unset;
    }
  }
`;

export const Th = styled.th`
  padding: 1em;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 0 1.5px -1px black;
  flex: 1 0 10em;
  display: flex;
`;

export const Td = styled.td`
  padding: 1em;
  box-sizing: border-box;
  text-align: left;
  box-shadow: 0 0 1.5px -1px black;
  flex: 1 0 10em;
`;

export const Tbody = styled.tbody`
  height: 365px;
  width: 100%;
  display: block;
  flex-direction: column;
  overflow-y: auto;
`;

export const Tr = styled.tr`
  display: flex;
  flex: 1 0;
  cursor: pointer;
  &:hover {
    background: #dddddd;
  }
`;

export const Tr_head = styled.tr`
  display: flex;
  flex: 1 0;
  cursor: pointer;
`;


/*
  Search Bar Styles
 */

export const SearchBox = styled.div`
	background: #FAFAFA;
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.12);
	border-radius: 3px;
  width: 100%;
  height: 48px;

	padding: 8px;
	margin: 16px;
  margin-top: 10px;
  margin-bottom: 0px;

	color: white;
	display: flex;
  flex-direction: row;
  justify-content: center;
`;

export const SearchMessage = styled.div`
    font-family: Roboto Mono;
    font-style: italic;
    font-weight: bold;
    line-height: normal;
    font-size: 33px;
    text-align: center;

    padding: 8px;
	  margin: 16px;

    color: #000000;

`;

export const SearchIconStyle = styled.img`
    width: 30px;
    opacity: 0.54;
    margin-top: 5px;
`;

export const SearchInput = styled.input`
    background-color: transparent; 
    border-style: none; 
    border: none;
    margin-left: 10px;
    type: search;
    width: 100%;
    font-family: Roboto Mono;
    
	&:focus {
		outline: none;
	}
`;

export const Input = styled.input`
    background-color: #FAFAFA;
    border: 1px solid #ccc;
    border-radius: 4px;
    type: text;
    width: 100%;
    font-family: Roboto Mono;
    padding: 5px;

	&:focus {
		outline: none;
	}
`;

export const Search = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 90%;
`;

/*
Button Styles
 */
export const Button = styled.button`
  background-color: white;
  border-color: #202020;
  color: #202020;
  padding: 5px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 2px 8px;
  border-radius: 4px;
  
  &:hover {
	  cursor: pointer;
	  background-color: #202020;
	  color: white;
	}
	-webkit-transition-duration: 0.4s; //safari
	transition-duration: 0.4s;
  
  &:focus {
		outline: none;
	}
	
	&:disabled{
	  color: grey;
    border-color: grey;
    background-color: white;
    cursor: default;
	}
`;

/*
Modal styles
*/
export const Modal = styled.div`
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
  `;


export const ModalContent = styled.div`
    justify-content: space-between;
    background-color: #fefefe;
    margin: auto;
    margin-top: 100px;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    border-radius: 4px;
    .cancel {
        cursor: pointer;
        position: relative;
        top: -8px;
        right: -8px;
        float: right;
    }
`;

export const ModalHeaderText = styled.div`
  padding-left: 8px;
  padding-right: 8px;
  margin-left: 16px;
  margin-right: 16px;
  margin-bottom: 16px;
  font-weight: bold;
  //text-decoration: underline;
  //color: #009688;
  font-size: 28px;
`;

export const ModalContentText = styled.div`
  padding-left: 8px;
  padding-right: 8px;
  margin-left: 16px;
  margin-right: 16px;
  `;

export const TableRow = ({ label, text }) => {
  return (
    <tr>
      <td style={{ width: "25%" }}><b>{label}</b></td>
      <td style={{ width: "75%", padding: "5px" }}>{text}</td>
    </tr>
  );
};

export const TableInput = ({ label, name, value, changeHandler, placeholder, onKeyDown }) => {
  return (
    <tr>
      <td><b>{label}</b></td>
      <td>
        <Input type='text' name={name} value={value}
               onChange={changeHandler}
               style={{ width: "100%" }}
               placeholder={placeholder ? placeholder : ""}
               onKeyDown={onKeyDown ? onKeyDown : undefined}
        />
      </td>
    </tr>
  );
};

export let capitalizeFirstLetters = (str) => {
  return str.replace(/\w\S*/g, function(txt){
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export let formattingCourseID = (str) => {
  let resultStr=str.toUpperCase();
  for (let i=0;i<resultStr.length;i++) {
    if (resultStr[i]>='0' && resultStr[i]<='9') {
      resultStr=resultStr.substr(0,i)+' '+resultStr.substr(i);
      break;
    }
  }
  return resultStr;
};

const defaultProfilePictureURL = "https://s3.amazonaws.com/apprentice-2019-profile-pictures/default.jpg"

// first either gets signed URL to download image from S3 or uses default
// then download corresponding picture from S3
// returns url which will give access to viewing profile picture
export let getProfilePicture = async (profile_picture, email) => {
  console.log(profile_picture)
  return new Promise(
    function(resolve, reject){
      if(profile_picture){
        fetch(`/v1/user/${email}/signGetProfilePhotoURL/`, {
          method: "GET",
        }).then(res => res.json())
        .then(data => {
          if(data.signedURL){
            resolve(data.signedURL);
          }
        }).catch(err => {
          reject(err);
        });
      } else {
        resolve(defaultProfilePictureURL);
      }
    }
  )

}