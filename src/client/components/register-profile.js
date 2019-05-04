import React, { Fragment, Component } from "react";
import { Button, Input, Modal, ModalContent, TableInput, TableRow } from "./shared";
import styled from "styled-components";
import { ProfileClassDisplay } from "./class-display";
import { Header } from "./header";
import { UserContext } from "./context/user-context";
import { stringify, parse } from "query-string";

import TagsInput from 'react-tagsinput'

const Joi = require('joi-browser');

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
let Pic = styled.img`
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

let GridContainer = styled.div`
  display: grid;
  grid-template-areas:
    'header header header header header header header header'
    '. name name name name name name .'
    '. pic pic table table table table .'
    '. pic pic . . buttons buttons .'
    '. . . tutor learn . . .';
  grid-gap: 15px;
  background-color: white;
  padding: 0px;
  font-family: Roboto Mono;
  font-style: italic;
  min-height: 100%;
`;

const defaultUser = {
  first_name: "", last_name: "",
  school: "", profile_picture: false,
  majors: [], minors: [],
  graduation_year: "", interests: [],
  classes_tutor: [], classes_learn: [],
  phone: "", email: "",
  blurb: "", //rating: []
  avgRating: 0
};

/********************************************************************************************
 *                      phone number input validation helpers
 *******************************************************************************************/
const getDigits = string => {
  let digits = "";
  for (let i=0; i<string.length; ++i)
    if (/\d/.test((string[i])))
      digits += string[i];
  return digits;
};

const formatPhoneNumber = digits => {
  let output = "";
  if (digits.length > 0 && digits.length <= 3)
    output = `${digits}`;
  else if (digits.length > 3 && digits.length <= 6)
    output = `${digits.slice(0,3)}-${digits.slice(3)}`;
  else if (digits.length > 6 && digits.length <= 10)
    output= `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6,10)}`;
  return output;
};

/********************************************************************************************
 *                      input validation helpers
 *******************************************************************************************/
const UserSchema = Joi.object().keys({
  first_name: Joi.string().trim().required().label('First Name'),
  last_name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  school: Joi.string().required(),
  // graduation_year: Joi.string().regex(/\d{4}/),
  phone: Joi.string().regex(/\d{10}/).required(),
  graduation_year: Joi.number().min(2000).required(),
  majors: Joi.array().items(Joi.string().trim()).min(1).required(),
  minors: Joi.array().items(Joi.string().trim()),
  interests: Joi.array().items(Joi.string().trim()),
  blurb: Joi.string().trim().required(),
  profile_picture: Joi.boolean().required(),
});
const validateUser = user => {
  return new Promise((resolve, reject) => {
    Joi.validate(user,UserSchema,{stripUnknown: true},(err,data) => {
      if (err)
        reject(err);
      else
        resolve(data);
    });
  })
};

const WelcomeBanner = ({ modalDisplay, handleModalDisplay }) => {
  return (
    <Modal style={{ display: modalDisplay ? "block" : "none" }}>
      <ModalContent>
        <span> Welcome to Apprentice! </span>
        <br/>
        <br/>
        <span> We're excited to have you join our community of learners. </span>
        <span> Our mission is to connect students who wish to help others learn with students who need tutors. Apprentice allows students
              to easily search for people who are able to provide help and allow them to connect with each other - all for free.
            </span>
        <br/>
        <br/>
        <div>
          <span>To begin, please give us some information about yourself.</span>
          <div style={{ marginTop: "10px" }}>
            <Button onClick={handleModalDisplay}>Okay!</Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};


class RegisterProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: defaultUser,
      modalDisplay: true,
      requestedTutor: false,
      tutorApproved: false,
      error: "",
    };

    this.onFieldChange = this.onFieldChange.bind(this);
    this.handleModalDisplay = this.handleModalDisplay.bind(this);
    this.createProfile = this.createProfile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handlePhoneInput = this.handlePhoneInput.bind(this);
    this.updateMajors = this.updateMajors.bind(this);
    this.updateMinors = this.updateMinors.bind(this);
    this.updateInterests = this.updateInterests.bind(this);
  }

  componentDidMount() {
    const picUrl = parse(this.props.history.location.search);

    this.setState({ user: { ...this.state.user, profile_picture: picUrl.profile_picture } });
    // pull information from querystring?
  }

  /**
   * onSubmit
   * @description - handler for the 'register' button on the register page. performs
   *  three major functions:
   *    1. formats and validates the data the user has entered
   *      if error, sets the error and returns from the function
   *    2. creates the users profile in the db by calling this.createProfile
   *    3. redirects to the /login page to log the user into Apprentice
   */
  async onSubmit() {
    try {
      const data = {
        ...this.state.user
      };

      data.email = this.props.match.params.username;
      data.avgRating = 0;
      data.phone = getDigits(data.phone);
      data.school = "Vanderbilt";

      const user = await validateUser(data);
      await this.createProfile(user);

      // redirect to /login
      const params = stringify({email: data.email});
      this.props.history.push(`/login?${params}`);
    } catch (err) {
      this.setState({error: err.details[0].message});
      console.error(err);
    }
  }

  /**
   * onFieldChange
   * @brief change handler for the inputs on the register form (with the
   *    exception of the phone number)
   * @param ev - js event emitted from the key change
   */
  onFieldChange(ev) {
    let user = this.state.user;
    user[ev.target.name] = ev.target.value;
    this.setState({ user: user });
  }

  /**
   * handlePhoneInput
   * @brief handler for the phone input on the register page
   *
   * this specialized input is used to manage formatting the phone number
   *  as the user types.  currently formats the number into xxx-xxx-xxxx form
   *  and does not allow more than 10 digits
   *
   * @param ev - js event
   */
  handlePhoneInput(ev) {
    let input = ev.target.value;
    let digits = getDigits(input);
    let output = formatPhoneNumber(digits);
    let user = this.state.user;
    user['phone'] = output;
    this.setState({ user: user });
  }

  /**
   * handleModalDisplay
   * @brief toggles the state of the modal (showing/not showing)
   */
  handleModalDisplay() {
    this.setState({ modalDisplay: !this.state.modalDisplay });
  }

  /**
   * createProfile
   * @brief creates new user in database
   *
   * @param user - validated user
   *
   */
  async createProfile(user) {
    try {

      let result = await fetch(`/v1/user`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!result.ok) {
        result = await result.json();
        return this.setState({ error: result.error });
      }

    } catch (err) {
      console.log(err);
    }
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

  render() {
    return (
      <GridContainer>
        <Item0>
          <Header {...this.props} {...this.state}/>
        </Item0>
        <Pic src={this.state.user.profile_picture}/>
        <Table>
          <tbody>

          <TableInput changeHandler={this.onFieldChange} label="First Name" value={this.state.user.first_name} name="first_name" placeholder="Harry"/>
          <TableInput changeHandler={this.onFieldChange} label="Last Name" value={this.state.user.last_name} name="last_name" placeholder="Potter"/>
          {/*<TableInput changeHandler={this.onFieldChange} label="School" value={this.state.user.school} name="school" placeholder="Hogwarts"/>*/}
          <TableRow label="School" text="Vanderbilt" />
          <TableInput changeHandler={this.handlePhoneInput} label="Phone Number" value={this.state.user.phone} name="phone" placeholder="123-456-789"/>
          <TableInput changeHandler={this.onFieldChange} label="Expected Graduation" value={this.state.user.graduation_year} name="graduation_year" placeholder="2019"/>
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
              {/*<Input type='text' name="interests" value={this.state.user.interests.toString()}*/}
                     {/*onChange={this.onFieldChange} placeholder="Eating,Sleeping,Drinking,..."/>*/}
            </td>
          </tr>
          <TableInput changeHandler={this.onFieldChange} label="About Me" value={this.state.user.blurb} name="blurb" placeholder="Quiditch Rocks"/>

          <tr>
            <td/>
            <td>
              <div style={{color: 'red'}}> {this.state.error} </div>
            </td>
          </tr>
          </tbody>
        </Table>
        <Buttons hidden={false}>
          { /* request tutor logic goes here */}
          <Button onClick={this.onSubmit}> Register </Button>
        </Buttons>

        {/*These are here just cause I wanted them to keep the top portion of the page formatted as it is*/}
        {/*but I was too lazy to actually format them.  So I left them but made them invisible lol*/}
        <Tutor style={{ opacity: 0 }}>
          <ProfileClassDisplay
            onProfile={true}
            title="Tutoring"
            courses={this.state.user.classes_tutor}
            to={"/editcourses/tutoring"}
            history={this.props.history}
            deleteFunc={this.deleteCourseFromTutor}
          />
        </Tutor>
        <Learn style={{ opacity: 0 }}>
          <ProfileClassDisplay
            onProfile={true}
            title="Learning"
            courses={this.state.user.classes_learn}
            to={"/editcourses/learning"}
            history={this.props.history}
            deleteFunc={this.deleteCourseFromLearn}
          />
        </Learn>
        <WelcomeBanner modalDisplay={this.state.modalDisplay} handleModalDisplay={this.handleModalDisplay}/>
      </GridContainer>
    );
  }
}


export const Register = props => {
  return(
    <UserContext.Consumer>
      {
        ({updateUser}) => <RegisterProfile updateUser={updateUser} {...props} />
      }
    </UserContext.Consumer>
  )
}
