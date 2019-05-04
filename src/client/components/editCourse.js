import React, { Component, Fragment }             from 'react';
import { Cart } from './cart.js';
import { CourseList } from './course-list';
import { SearchBar } from './searchBar';
import { Button, Modal, ModalContent,ModalHeaderText } from "./shared";
import styled from 'styled-components';
import { Add } from "./add";
import { Header } from "./header";

import { UserContext } from "./context/user-context";

import ObjectSet from 'custom-object-set';


let Item0=styled.div`grid-area: header;`;
let Item2=styled.div`grid-area: search;`;
let Item3=styled.div`grid-area: cart;`;
let Item4=styled.div`grid-area: list;`;
let Item5=styled.div`
  grid-area: footer;
  text-align: right;
  `;

let GridContainer=styled.div`
  display: grid;
  grid-template-areas:
    'header header header header  header  header  header header'
    '. . search search  search  cart    . .'
    '. . list   list    list    list    . .'
    '. . .      .       .       footer  . .';
  grid-gap: 20px;
  background-color: white;
  padding: 0px;
`;

class Course extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchList: [],
      cart: [],
      search_mode: `Course ID`,
      search_value: ``,
      modalDisplay: false,
      state: props.user,
    };

    /**
     * so if you store things in react state and update them with setState, it triggers a re-render
     *  if the object has changed (no matter what,even if it's just internal state) also, I'm storing the
     *  courses in the cart/search_list in sets, so it'd be more work to integrate that into react state
     *
     *  I use this 'meta_state' to store the classes and just update react when it's necessary to re-render
     *  the page.
     */
    this.meta_state = {
      filter_list: new ObjectSet(this.getUserClasses()),
      cart: new ObjectSet(),
      search_results: new ObjectSet(),
    };

    this.search = this.search.bind(this);
    this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
    this.onAddCourse = this.onAddCourse.bind(this);
    this.onDeleteCourse = this.onDeleteCourse.bind(this);
    this.addCourseToCart = this.addCourseToCart.bind(this);
    this.deleteCourseFromCart = this.deleteCourseFromCart.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
    this.onClickSearchOption = this.onClickSearchOption.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.getUserClasses = this.getUserClasses.bind(this);
    this.handleModalDisplay = this.handleModalDisplay.bind(this);
    this.resultsFilter = this.resultsFilter.bind(this);
  }

  async handleKeyboardInput(ev) {
    await this.setState({search_value: ev.target.value});
    this.search();
  }

  async onClickSearchOption(ev) {
    await this.setState({search_mode: ev.target.id});
    this.search();
  };

  /**
   * resultsFilter
   * @param course - course to filter
   * @returns {boolean} true if the course DNE in the cart or the tutor has
   *      already selected that course
   */
  resultsFilter(course){
    return !(this.meta_state.filter_list.has({
      course_id: course.course_id,
      course_name: course.course_name,
    }) || this.meta_state.cart.has({ course_id: course.course_id }));
  }

  async search() {
    // cannot search for an empty value
    if (this.state.search_value === "") {
      this.meta_state.search_results.reset([]);

      return this.setState({
        searchList: this.meta_state.search_results.to_list(),
      });
    }

    try {
      let query_uri = `/v1/class/${this.state.search_mode===`Course ID` ? `searchById`:`searchByName`}/${this.state.search_value}`;
      let search_results = await fetch(query_uri);
      search_results = await search_results.json();
      search_results = search_results.map(course => {
        return {
          course_id: course.course_id,
          course_name: course.course_name,
        }
      });

      // here we filter results - only classes that the tutor has not already 'enrolled' in
      //  or that already are not in the cart should be displayed
      search_results = search_results.filter(this.resultsFilter);
      this.meta_state.search_results.reset(search_results);

      this.setState({
        searchList: this.meta_state.search_results.to_list(),
      });
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * handler for clicking the '+' button on a course
   *  really just redirects to this.addCourseToCart
   * @param ev - event containing the course name and course id
   */
  onAddCourse(ev) {
    let course={ course_id: ev.target.id, course_name: ev.target.name};
    this.addCourseToCart(course);
  }

  onDeleteCourse(ev) {
    let course={ course_id: ev.target.id, course_name: ev.target.name};
    this.deleteCourseFromCart(course);
  }

  onClickCancel() {
    this.props.history.goBack();
  }

  async updateUser(data) {
    await fetch(`/v1/user/${localStorage.getItem('email')}`, {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({   
                ...data,
                email: localStorage.getItem('email')
        })
    });
  }

  getUserClasses() {
    if (this.props.match.params.type === 'tutoring')
        return this.props.user.classes_tutor;
    return this.props.user.classes_learn;
  }

  async onClickSave() {
    let courses = this.state.cart;
    courses = courses.concat(this.meta_state.filter_list.to_list());

    // are we updating the tutor?
    let updateTutor = this.props.match.params.type === 'tutoring';
    if (updateTutor) {
        await this.updateUser({
            classes_tutor: courses.map(course => course.course_id)
        });
        this.props.updateUser({
            ...this.state.user,classes_tutor: courses
        })
    } else {
        await this.updateUser({
            classes_learn: courses.map(course => course.course_id)
        });
        this.props.updateUser({
            ...this.state.user,classes_learn: courses
        });
    }
    this.props.history.push(`/profile/${localStorage.getItem('email')}`);
  }

  handleModalDisplay() {
    this.setState({modalDisplay: !this.state.modalDisplay});
  }

  render() {
    return (
        <GridContainer>
          <Item0>
            <Header {...this.props} {...this.state}/>
          </Item0>
          <Item2>
            <SearchBar searchHint={`Search course`}
                       onChange={this.handleKeyboardInput}
                       options={['Course ID','Course Name']}
                       onClickSearchOption={this.onClickSearchOption}
                       curSearchMode={this.state.search_mode}
                       value={this.state.search_value}
            />
          </Item2>
          <Item3>
            <Cart cart={this.state.cart}
                  onDeleteCourse={this.onDeleteCourse}/>
          </Item3>
          <Item4>
            <CourseList resultList={this.state.searchList}
                        onAddCourse={this.onAddCourse}
                        handleModalDisplay={this.handleModalDisplay}
            />
          </Item4>
          <Item5>
            <Button onClick={this.onClickCancel}>Cancel</Button>
            <Button onClick={this.onClickSave}>Save and Return</Button>
          </Item5>
          <Modal style={{display: this.state.modalDisplay? "block" : "none"}}>
            <ModalContent>
              <div>
                <img className="cancel" src={"/images/round-cancel.svg"} onClick={this.handleModalDisplay}/>
                <ModalHeaderText>Add new course(s) into Apprentice:</ModalHeaderText>
              </div>
              <Add handleModalDisplay={this.handleModalDisplay}/>
            </ModalContent>
          </Modal>
        </GridContainer>
    );
  }

  addCourseToCart(course) {
    this.meta_state.cart.add(course);
    this.meta_state.search_results.delete(course);

    this.setState({
      searchList: this.meta_state.search_results.to_list(),
      cart: this.meta_state.cart.to_list(),
    });
  }

  deleteCourseFromCart(course) {
    this.meta_state.cart.delete(course);
    this.meta_state.search_results.add(course);

    this.setState({
      searchList: this.meta_state.search_results.to_list(),
      cart: this.meta_state.cart.to_list(),
    });
  }
}

export const EditCourse = ({history, updateTutoring, updateLearning, match}) => {
  return(
    <UserContext.Consumer>
      {
        ({user,updateUser}) =>
          <Course history={history} updateTutoring={updateTutoring} updateLearning={updateLearning} user={user} updateUser={updateUser} match={match}/>
      }
    </UserContext.Consumer>
  )
};