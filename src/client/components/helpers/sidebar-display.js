import React, { Fragment } from 'react';
import styled from 'styled-components';

export const Wrapper = (SideBar,OtherContent) => {
    return props => {
        //console.log(props);

        if (props.showSidebar) {
            return <Fragment> 
                <SideBar /> 
                <OtherContent {...props} /> 
            </Fragment>;
        } else {
            return <OtherContent {...props} />;
        }
    }
};
