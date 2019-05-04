import React, { Component, Fragment }             from 'react';
import { SideBar } from './sidebar';
import { SearchBar } from './searchBar';
import { TutorList } from './tutor-list';
import styled from 'styled-components';
import { Header } from "./header";

let Item0=styled.div`
    grid-area: header;
    height: 100%;
`;
let Item1=styled.div`
    grid-area: sidebar;
    height: 100%;
`;
let SearchBox=styled.div`
    grid-area: search;
    `;
let List=styled.div`
    grid-area: list;
    `;

let GridContainer=styled.div`
  display: grid;
  grid-template-areas:
    'header header header header header header'
    'sidebar search search search . .'
    'sidebar list list list . .';
  background-color: white;
  min-height: 100%;
  grid-gap: 0px 0px;
`;

export class Search extends Component{
    constructor(props) {
        super(props);
        this.state = {
            cart: [],
            value: this.props.location.state ? this.props.location.state.value : '',
            resultList: [],
            search_mode: this.props.location.state ? this.props.location.state.search_mode : 'Course ID'
        };

        this.props.location.state = null;
        this.onClickSearchOption = this.onClickSearchOption.bind(this);
        this.search = this.search.bind(this);
        this.updateState = this.updateState.bind(this);
    }

    componentDidMount(){
        this.search();
    }

    async updateState(ev) {
      await this.setState({ value: ev.target.value });
      this.search();
    }

    async onClickSearchOption(ev) {
        await this.setState({search_mode: ev.target.id});
        this.search();
    }

    search(){
      if (this.state.value.length === 0)
        return this.setState({ resultList: [] });
      let url = '';
      if(this.state.search_mode === `Course Name`){
          url += '/v1/class/' + this.state.value + '/tutorsByCourseName';
      } else if(this.state.search_mode === `Course ID`){
          url += '/v1/class/' + this.state.value + '/tutorsById';
      } else {
          url += '/v1/user/searchTutorByName/' + this.state.value;
      }
      fetch(url)
      .then(res => res.json())
      .then(data => {
          if (data===undefined) {
              this.setState({resultList: []});
          } else {
              const email = localStorage.getItem('email');
              data = this.state.search_mode === 'Tutor' ? data : data.tutors;
              data = data.filter(tutor => tutor.email !== email);
              this.setState({resultList: data});
          }
      }).catch(err=>console.log(err));
    }

    render(){
        const { history } = this.props; // used for row in TutorList to be clickable
        return (
          <GridContainer>
              <Item0>
                  <Header {...this.props} {...this.state}/>
              </Item0>
              <Item1>
                  <SideBar/>
              </Item1>
              <SearchBox>
                  <SearchBar searchHint={`Search by Course ID, Course Name, or Tutor name`}
                             value={this.state.value}
                             onChange={this.updateState}
                             options={['Course ID','Course Name','Tutor']}
                             curSearchMode={this.state.search_mode}
                             onClickSearchOption={this.onClickSearchOption}
                  />
              </SearchBox>
              <List>
                  <TutorList history={history} resultList={this.state.resultList}/>
              </List>
          </GridContainer>
        )
    }
}
