import React, { Component, Fragment } from "react";
import styled from "styled-components";
import { SideBar } from "./sidebar";
import { SearchBar } from "./searchBar"
import { Header } from "./header";

let Item0=styled.div`
    grid-area: header;
    height: 100%;
`;
let Item1=styled.div`
    grid-area: sidebar;
    height: 100%;
    
`;
let Item2=styled.div`
    grid-area: content;
    height: 100%;
`;

let GridContainer=styled.div`
    display: grid;
    grid-template-areas:
        'header header header header header header'
        'sidebar content content content . .';
    background-color: white;
    min-height: 100%;
    grid-gap: 0px 0px;
`;

const Search = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    vertical-align: center;
`;

export class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ...this.props.user,
            value: '',
            search_mode: `Course ID`
        };

        this.submit = this.submit.bind(this);
        this.onFieldChange = this.onFieldChange.bind(this);
        this.onClickSearchOption = this.onClickSearchOption.bind(this);
    }

    async componentDidMount() {
      try {
        const email = localStorage.getItem('email');
        let user = await (await fetch(`/v1/user/${email}`)).json();
        this.props.updateUser(user);
      } catch (err) {
        console.error(err);
      }
    }

    onFieldChange(ev){
        this.setState({ value: ev.target.value });
    }

    onClickSearchOption(ev) {
        this.setState({search_mode: ev.target.id});
    }

    submit(ev) {
        if(ev.key === 'Enter'){
            console.log('Search for ' + ev.target.value);
            this.props.history.push({
                pathname: '/search',
                state: {value: this.state.value,
                        search_mode: this.state.search_mode}
              });
        }
    }

    render(){
        return (
          <GridContainer>
              <Item0>
                  <Header {...this.props} {...this.state}/>
              </Item0>
              <Item1>
                  <SideBar {...this.state}/>
              </Item1>
              <Item2>
                <Search>
                  <SearchBar
                        searchMsg="Connect with tutors"
                        searchHint="Search for tutors by Course ID, Course Name, or Tutor Name"
                        onKeyPress={this.submit}
                        options={["Course ID", "Course Name", "Tutor"]}
                        value={this.state.value}
                        onChange={this.onFieldChange}
                        curSearchMode={this.state.search_mode}
                        onClickSearchOption={this.onClickSearchOption}
                        showOptions={false}
                  />
                </Search>
              </Item2>
          </GridContainer>
        )
    }
}
