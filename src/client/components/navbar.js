/**
 * Component to display the bar that is displayed underneath the 
 * 	header allowing the user to return to previous pages
 * 	
 */
import React, { Component, Fragment } from "react";

import styled from 'styled-components';

const NavButton = styled.div`
	padding: 4px;
	&:hover {
		cursor: pointer;
	}
	display: flex;
`;

const NavText = styled.div`
	padding: 4px;
	font-weight: bold;
	// &:hover {
	// 	cursor: pointer;
	// }
`;


export const NavBar = ({onClick=()=>{console.log('NavBar clicked')}, text=''}) => {
	let txt=`Back to search result for "${text}"`;

	return(
		<NavButton onClick={onClick}>
			<img src='/images/back-arrow.svg'></img>
			<NavText>{txt}</NavText>
		</NavButton>
	)
};
