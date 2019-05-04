import React, { Fragment, Component } from "react";
import { Button, Input, 
  Modal, ModalContent, 
  TableRow, TableInput, getProfilePicture } from "./shared";

import styled from "styled-components";
import { ProfileClassDisplay } from "./class-display";
import { Header } from "./header";
import { RatingBoard} from "./rating-board";
import { UserContext } from "./context/user-context";

import TagsInput from "react-tagsinput";


let Item0 = styled.div`grid-area: header;`;
let Table = styled.table`grid-area: table;`;
let Buttons = styled.div`
    grid-area: buttons;
    text-align: right;
    `;
let Learn = styled.div`
    grid-area: learn;
    justify-content:center;
`;
let Tutor = styled.div`
    grid-area: tutor;
    justify-content: center;
`;
let Pic = styled.div`
    grid-area: pic;
    width: 300px;
    border-radius: 20px;
`;
const Name = styled.div`
    grid-area: name;
	  text-align: center;
    font-weight: bold;
    line-height: normal;
    font-size: 30px;
    line-height: normal;
`;
let Rating=styled.div`
    grid-area: rating;
    text-align: center;
    width: 300px;
`;

let ImgSquareCrop = styled.img`
  object-fit: cover;
  width:300px;
  height:300px;
  padding: 8px;
`

let GridContainer = styled.div`
  display: grid;
  grid-template-areas:
    'header header header header header header header header'
    '. name name name name name name .'
    '. pic pic table table table table .'
    '. pic pic . . buttons buttons .'
    '. rating . tutor learn . . .';
  grid-gap: 15px;
  background-color: white;
  padding: 0px;
  font-family: Roboto Mono;
  //font-style: italic;
  min-height: 100%;
`;

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: this.props.user,
      modalDisplay: "none",
      selectedClassDelete: "none",
      tmpRating: 0,
      profileURL: "",
    };

    this.onFieldChange = this.onFieldChange.bind(this);
    this.cancelChanges = this.cancelChanges.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.updateClassesTutor = this.updateClassesTutor.bind(this);
    this.updateClassesLearn = this.updateClassesLearn.bind(this);
    this.deleteCourseFromTutor = this.deleteCourseFromTutor.bind(this);
    this.deleteCourseFromLearn = this.deleteCourseFromLearn.bind(this);
    this.handleModalDisplay = this.handleModalDisplay.bind(this);
    this.updateSelectedClassDelete = this.updateSelectedClassDelete.bind(this);
    this.deleteCourse = this.deleteCourse.bind(this);
    this.updateMajors = this.updateMajors.bind(this);
    this.updateMinors = this.updateMinors.bind(this);
    this.updateInterests = this.updateInterests.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    // dumb check to see if the user is there yet
    if (this.state.user.first_name.length === 0) {
      fetch(`/v1/user/${localStorage.getItem('email')}`)
        .then(res => res.json())
        .then(user => this.setState({user: {...this.state.user, ...user}}));
    }

    if (this.state.profileURL.length === 0) {
      fetch(`/v1/user/${localStorage.getItem('email')}/signGetProfilePhotoURL/`)
        .then(res => res.json())
        .then(({signedURL}) => this.setState({ user: {...this.state.user, profileURL: signedURL }}));
    }
    
  }

  updateClassesTutor(newCourses) {
    this.setState({ classes_tutor: newCourses });
  }

  updateClassesLearn(newCourses) {
    this.setState({ classes_learn: newCourses });
  }

  onFieldChange(ev) {
    let user = this.state.user;
    if (ev.target.name === 'majors' || ev.target.name === 'minors')
      user[ev.target.name] = ev.target.value.split(",");
    else
      user[ev.target.name] = ev.target.value;
    this.setState({ user: user });
  }

  cancelChanges() {
    // redirect to home once profile is edited
    this.props.history.push("/home");
  }

  async handleModalDisplay(value = "none", cb = ()=>{}) {
    await this.setState({ modalDisplay: value });
    cb();
  }

  updateSelectedClassDelete(value = "none"){
    this.setState({ selectedClassDelete: value })
  }

  /**
   * deletes a course from the associated tutor in the database
   * @param course_id - the id of the course (i.e., cs2201)
   * @param type - either 'classes_tutor' or 'classes_learn'
   * @returns {Promise<Response>}
   */
  deleteCourse(course_id, type) {
    return fetch(`/v1/user/deleteClass/${this.state.user.email}`,{
      method: "PUT",
      body: JSON.stringify({
        course_id: course_id,
        type: type,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /*
   * deleteCourseFromTutor
   *
   * deletes a class from the current user's list of courses
   *  tutoring and updates component state to re-render
   *
   * @param id: course_id to be deleted (i.e., 'CS2201')
   */
  async deleteCourseFromTutor() {
    let id = this.state.selectedClassDelete;
    if(id !== "none"){
      try {
        await this.deleteCourse(id,'classes_tutor');

        // update react component state
        // maybe there is a better way to deep copy in JS?
        let classes = JSON.parse(JSON.stringify(this.state.user.classes_tutor));

        classes = classes.filter(
          course => course.course_id !== id
        );

        this.props.updateUser({ classes_tutor: classes });
        this.setState({ user: { ...this.state.user, classes_tutor: classes}});

      } catch (err) {
        console.error(err);
      }
    }
  }

  /*
   * deleteCourseFromLearn
   *
   * deletes a class from the current user's list of courses
   *  learning and updates component state to re-render
   *
   * @param id: course_id to be deleted (i.e., 'CS2201')
   */
  async deleteCourseFromLearn() {
    let id = this.state.selectedClassDelete;
    if(id !== "none"){
      try {
        await this.deleteCourse(id,'classes_learn');

        // update react component state
        // maybe there is a better way to deep copy in JS?
        let classes = JSON.parse(JSON.stringify(this.state.user.classes_learn));

        classes = classes.filter(
          course => course.course_id !== id
        );

        this.props.updateUser({ classes_learn: classes });
        this.setState({ user: { ...this.state.user, classes_learn: classes}});
      } catch (err) {
        console.error(err);
      }
    }

  }
  saveChanges() {
    // send new data to server
    let data = Object.assign({},this.state.user);

    // we should only be able to update rating if we are rated
    //delete data.rating;

    // PUT request required only course_ids
    data.classes_learn = data.classes_learn.map(course => course.course_id);
    data.classes_tutor = data.classes_tutor.map(course => course.course_id);

    fetch(`/v1/user/${this.state.user.email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => {
      // update the user state
      this.props.updateUser(this.state.user);
      this.props.history.push("/home");
    }).catch(err => {
      console.log(err);
    });
  }

  updateMajors(tags) {
    const user = {...this.state.user, majors: tags};
    this.setState({user: user});
  }

  updateMinors(tags) {
    const user = {...this.state.user, minors: tags};
    this.setState({user: user});
  }

  updateInterests(tags) {
    const user = {...this.state.user, interests: tags};
    this.setState({user: user});
  }

  async onChange(e){
    let photo = e.target.files[0];
    fetch(`/v1/user/${this.state.user.email}/signUploadProfilePhotoURL/`, {
      method: "GET",
    }).then(res => res.json())
    .then(data => {
      //console.log(data);
      if(data){
        this.uploadProfilePicture(data.signedURL, photo);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  uploadProfilePicture(signedURL, photo){
    try{
      fetch(signedURL, {
        method: "PUT",
        body: photo})
      .then(res => res.body.toString())
      .then(data  => {
        //console.log(data);
        if(data){
          console.log("uploaded to s3 successfully");
          // TODO -- update state of user in database
          getProfilePicture(this.state.user.profile_picture, this.state.user.email)
          .then(profileURL=>{
            fetch(`/v1/user/${this.state.user.email}/profilePhoto/?upload=true`,{
              method: "PUT",
            }).then(data=>{
              let newUser = this.state.user;
              newUser.profileURL = profileURL;
              newUser.profile_picture = true;
              this.props.updateUser({user: newUser});
            })
          })
        } else {
          console.log("error");
        }});
    } catch(err){
      console.log(err)
    }
  }

  render() {
    const tutoring = this.state.user.classes_tutor.map(item => item.course_id);
    const learning = this.state.user.classes_learn.map(item => item.course_id);
    //console.log(this.state.user.profileURL);
    return (
      <GridContainer>
        <Item0>
          <Header {...this.props} {...this.state}/>
        </Item0>
        <Name>
          {this.state.user.first_name} {this.state.user.last_name}
        </Name>
        <Pic>
          <ImgSquareCrop src={this.state.user.profileURL}/>
          
          <Button className='uploadProfileButton' style={{width: '100%'}}>
              <label htmlFor='single'>
                Upload profile picture
              </label>
              <input type='file' id='single' onChange={this.onChange} /> 
          </Button>
        </Pic>
        
        <Table>
          <tbody>
          <TableRow label="School:" text={this.state.user.school}/>
          <TableRow label="Email:" text={this.state.user.email}/>
          <TableRow label="Phone Number:" text={this.state.user.phone}/>
          <TableInput
            label="Expected Graduation"
            name="graduation_year"
            value={this.state.user.graduation_year}
            changeHandler={this.onFieldChange}
          />
          <tr>
            <td style={{ width: "25%" }}><b>Major(s)</b></td>
            <td style={{ width: "75%" }}>
              <TagsInput value={this.state.user.majors} onChange={this.updateMajors}/>
            </td>
          </tr>
          <tr>
            <td><b>Minor(s)</b></td>
            <td>
              <TagsInput value={this.state.user.minors} onChange={this.updateMinors}/>
            </td>
          </tr>
          <tr>
            <td><b>Interests</b></td>
            <td>
              <TagsInput value={this.state.user.interests} onChange={this.updateInterests}/>
            </td>
          </tr>
          <TableInput
            label="About Me"
            name="blurb"
            value={this.state.user.blurb.toString()}
            changeHandler={this.onFieldChange}
          />
          </tbody>
        </Table>
        <Buttons>
          <Button onClick={this.cancelChanges}>Cancel</Button>
          <Button onClick={this.saveChanges}>Save Changes</Button>
        </Buttons>
        <Tutor>
          <ProfileClassDisplay
            onProfile={true}
            title="Tutoring"
            courses={tutoring}
            to={"/editcourses/tutoring"}
            history={this.props.history}
            deleteFunc={(value)=>this.handleModalDisplay("tutor",this.updateSelectedClassDelete(value))}
          />
        </Tutor>
        <Learn>
          <ProfileClassDisplay
            onProfile={true}
            title="Learning"
            courses={learning}
            to={"/editcourses/learning"}
            history={this.props.history}
            deleteFunc={(value)=>this.handleModalDisplay("learn",this.updateSelectedClassDelete(value))}
          />
        </Learn>
        <Rating>
          <RatingBoard tutorEmail={this.state.user.email}/>
        </Rating>
        <Modal style={{ display: this.state.modalDisplay !== "none" ? "block" : "none" }}>
          <ModalContent>
            <div>
              <img className="cancel" src={"/images/round-cancel.svg"}
                   onClick={()=>this.handleModalDisplay("none")}
              />
              <span>
                  Are you sure you want to delete {this.state.selectedClassDelete} from your {this.state.modalDisplay}ing course list?
                </span>
              <div style={{ marginTop: "10px" }}>
                <Button onClick={this.state.modalDisplay === "tutor" ?
                  ()=>this.handleModalDisplay("none", this.deleteCourseFromTutor) :
                  ()=>this.handleModalDisplay("none", this.deleteCourseFromLearn)}>
                  Delete
                </Button>
                <Button onClick={()=>this.handleModalDisplay("none")}>Cancel</Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </GridContainer>
    );
  }
}

export const EditableProfile = ({match,history}) => {
  return (
    <UserContext.Consumer>
      {
        ({user,updateUser}) => {
          return <Profile user={user} updateUser={updateUser} match={match} history={history}/>
        }
      }
    </UserContext.Consumer>
  )
};

