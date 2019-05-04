import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Search, SearchBox, SearchIconStyle, SearchInput, SearchMessage } from './shared';

const Option_unselected = styled.div`
  cursor: pointer;
  font-style: italic;
  font-weight: bold;
  color: DarkGrey;
`;

const Option_selected = styled.div`
  cursor: pointer;
  font-style: italic;
  font-weight: bold;
  color: Black;
`;

const Option = ({optionName, onClick, selected}) => {
  if (selected) {
    return (
      <Option_selected id={optionName} onClick={onClick}>
        {optionName}
      </Option_selected>
    );
  } else {
    return (
      <Option_unselected id={optionName} onClick={onClick}>
        {optionName}
      </Option_unselected>
    );
  }
};

const OptionBox = styled.div`
	background: #EEEEEE;
	border-radius: 3px;
	width: 100%;
	
	padding: 8px;
	margin: 16px;
	margin-top: 0px;

	color: black;
	display: grid;
	flex-direction: column;
	position: relative;

	grid-template-areas:
    'option1 option2 option3';
`;

let Item1=styled.div`grid-area: option1;`;
let Item2=styled.div`grid-area: option2;`;
let Item3=styled.div`grid-area: option3;`;

export class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state={
      searchMsg: this.props.searchMsg,
      searchHint: this.props.searchHint,
      searchOptions: 0,
      showOptions: props.showOptions !== undefined ? props.showOptions: true,
    };
    if (this.props.options!==undefined && Array.isArray(this.props.options)) {
      this.state.searchOptions=this.props.options.length;
    }
  }

  render() {
    return (
      <Search>
        <SearchMessage>{this.state.searchMsg}</SearchMessage>
        <SearchBox>
          <SearchIconStyle src="/images/search.svg"/>
          <SearchInput placeholder={this.state.searchHint}
                       onKeyPress={this.props.onKeyPress}
                       value={this.props.value}
                       onChange={this.props.onChange}/>
        </SearchBox>
        <OptionBox style={{opacity: this.state.showOptions ? 100 : 0}}>
          <Item1>
            <Option
              optionName={this.state.searchOptions>=1 ? this.props.options[0]:''}
              onClick={this.props.onClickSearchOption}
              selected={this.props.curSearchMode===this.props.options[0]}
            />
          </Item1>
          <Item2>
            <Option
              optionName={this.state.searchOptions>=2 ? this.props.options[1]:''}
              onClick={this.props.onClickSearchOption}
              selected={this.props.curSearchMode===this.props.options[1]}
            />
          </Item2>
          <Item3>
            <Option
              optionName={this.state.searchOptions>=3 ? this.props.options[2]:''}
              onClick={this.props.onClickSearchOption}
              selected={this.props.curSearchMode===this.props.options[2]}
            />
          </Item3>
        </OptionBox>
      </Search>
    )
  }
}
