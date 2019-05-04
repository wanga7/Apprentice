import React, { Fragment, Component } from "react";
import { Button,
  Modal, ModalContent, ModalHeaderText, ModalContentText, TableRow, TableInput} from "./shared";

import styled from "styled-components";
import { SidebarClassDisplay, ProfileClassDisplay } from "./class-display";
import { Header } from "./header";
import { RatingBoard} from "./rating-board";
import { RatingBar} from "./rating-bar";
import { CompatibleCoursesBar } from "./compatible-courses-bar";

import { getProfilePicture } from "./shared"

import { stringify } from "query-string";


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

let ImgSquareCrop = styled.img`
  grid-area: pic;
  object-fit: cover;
  width:300px;
  height:300px;
  padding: 8px;
  border-radius: 20px;
`

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
let Compatible=styled.div`
    grid-area: comp;
`;

let GridContainer = styled.div`
  display: grid;
  grid-template-areas:
    'header header header header header header header header'
    '. name name name name name name .'
    '. pic pic table table table table .'
    '. pic pic comp comp buttons buttons .'
    '. rating . tutor learn . . .';
  grid-gap: 15px;
  background-color: white;
  padding: 0px;
  font-family: Roboto Mono;
  //font-style: italic;
  min-height: 100%;
`;

const defaultUser = {
  firstName: "", lastName: "",
  school: "", profile_picture: false,
  majors: [], minors: [],
  graduation_year: 0, interests: [],
  classes_tutor: [], classes_learn: [],
  phone: "", email: "",
  blurb: "", rating: -1
};


export class FixedProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: defaultUser,
      modalDisplay: false,
      modalDisplay_Rating: false,
      requestedTutor: false,
      tutorApproved: false
    };

    this.handleModalDisplay = this.handleModalDisplay.bind(this);
    this.handleModalDisplay_Rating=this.handleModalDisplay_Rating.bind(this);
    this.requestTutor = this.requestTutor.bind(this);
    this.updateRating = this.updateRating.bind(this);
    this.updateTmpRating = this.updateTmpRating.bind(this);
  }

  async componentDidMount() {
    try {
      const url = `/v1/user/${this.props.match.params.username}`;
      let mapFunc = item => item.course_id;
      let data = await (await fetch(url)).json();
      data.classes_tutor = data.classes_tutor.map(mapFunc);
      data.classes_learn = data.classes_learn.map(mapFunc);
      await this.setState({ user: data });
      //console.log('profile component - this.state:',this.state.user.email);
      getProfilePicture(this.state.user.profile_picture, this.state.user.email)
        .then(signedURL=>{
          this.setState({profileURL: signedURL});
          //console.log("set state");
        });
    } catch (err) {
      console.error(err);
    }
    try {
      const params = stringify({
        connector: localStorage.getItem("email"),
        connectee: this.props.match.params.username
      });

      const uri = `/v1/connection/status?${params}`;
      const res = await fetch(uri);

      // TODO: why does this print an error that content was not found?
      if (res.status === 404) {
        return this.setState({ tutorApproved: false });
      }

      const body = await res.json();
      if (body.status === "ACCEPTED")
        this.setState({ tutorApproved: true });
    } catch (err) {
      console.error(err);
    }
  }

  handleModalDisplay() {
    this.setState({ modalDisplay: !this.state.modalDisplay });
  }

  async handleModalDisplay_Rating() {
    this.setState({modalDisplay_Rating: !this.state.modalDisplay_Rating});

    let data = await (await fetch(`/v1/rating/${this.state.user.email}/${localStorage.getItem("email")}`)).json();
    this.setState({tmpRating: data.rating});
  }

  updateTmpRating(val) {
    this.setState({tmpRating: val});
    //console.log('profile - updateTmpRating: ', val);
  }

  async updateRating() {
    console.log('profile - updateRating');
    try {
      let data={
        studentEmail: localStorage.getItem("email"),
        rating: this.state.tmpRating
      };
      //console.log('data to write into db: ',data);

      fetch(`/v1/rating/${this.state.user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(res => {

      }).catch(err => {
        console.log(err);
      });

    } catch (err) {
      console.error(err);
    }
    this.handleModalDisplay_Rating();
  }

  async requestTutor() {
    try {
      const data = {
        "connector": sessionStorage.getItem("email"),
        "connectee": this.state.user.email
      };
      // await fetch('http://localhost:8081/initiateConnection',{
      //     method: 'POST',
      //     body: JSON.stringify(data),
      //     headers: {
      //         'Content-Type': 'application/json'
      //     }
      // });
    } catch (err) {
      console.log(err);
    }
    await this.setState({ requestedTutor: true });
  }

  render() {
    return (
      <GridContainer>
        <Item0>
          <Header history={this.props.history} />
        </Item0>
        <Name>
          {this.state.user.first_name} {this.state.user.last_name}
        </Name>
        <ImgSquareCrop src={this.state.profileURL}/>
        <Table>
          <tbody>

          {/*<TableRow label="Rating:" text={this.state.user.rating}/>*/}
          <TableRow label="School:" text={this.state.user.school}/>
          {
            this.state.tutorApproved ?
              <Fragment>
                <TableRow label="Email:" text={this.state.user.email}/>
                <TableRow label="Phone Number:" text={this.state.user.phone}/>
              </Fragment>
              :
              <Fragment/>
          }

          <TableRow label="Expected Graduation:" text={this.state.user.graduation_year}/>
          <TableRow label="Major(s):" text={this.state.user.majors.toString()}/>
          <TableRow label="Minor(s):" text={this.state.user.minors.toString()}/>
          <TableRow label="Interests:" text={this.state.user.interests.toString()}/>
          <TableRow label="About me:" text={this.state.user.blurb.toString()}/>
          </tbody>

        </Table>
        <Buttons>
          {
            //TODO: change the judge criterion to this.state.tutorApproved when deployed
            this.state.tutorApproved ?
              <Button onClick={this.handleModalDisplay_Rating}> Rate Tutor </Button>
              :
              <Button onClick={this.handleModalDisplay} disabled={this.state.requestedTutor}> Request Tutor </Button>
          }
        </Buttons>
        <Tutor>
          <SidebarClassDisplay
            title="Tutoring"
            courses={this.state.user.classes_tutor}
          />
        </Tutor>
        <Learn>
          <ProfileClassDisplay
            title="Learning"
            courses={this.state.user.classes_learn}
          />
        </Learn>
        <Rating>
          <RatingBoard tutorEmail={this.state.user.email}/>
        </Rating>
        <Compatible>
          <CompatibleCoursesBar
            tutor_name={this.state.user.first_name}
            tutor_tutoring={this.state.user.classes_tutor}
            tutor_learning={this.state.user.classes_learn}
          />
        </Compatible>
        <Modal style={{ display: this.state.modalDisplay ? "block" : "none" }}>
          <ModalContent>
            {!this.state.requestedTutor ?
              <div>
                <img className="cancel" src={"/images/round-cancel.svg"} onClick={this.handleModalDisplay}/>
                <ModalContentText>
                  <span>Are you sure you want to request {this.state.user.first_name} {this.state.user.last_name} as your tutor?</span>
                  <div style={{ marginTop: "10px" }}>
                    <Button onClick={this.requestTutor}>Request</Button>
                    <Button onClick={this.handleModalDisplay}>Cancel</Button>
                  </div>
                </ModalContentText>
              </div> :
              <div>
                <img className="cancel" src={"/images/round-cancel.svg"} onClick={this.handleModalDisplay}/>
                <ModalContentText>
                  <img className="confirmation" src={"/images/check.png"}/>
                  Tutor has been requested! You will receive their contact info to reach out for scheduling.
                </ModalContentText>
              </div>
            }
          </ModalContent>
        </Modal>
        <Modal style={{display: this.state.modalDisplay_Rating ? "block":"none"}}>
          <ModalContent>
            <div>
              <img className="cancel" src={"/images/round-cancel.svg"} onClick={this.handleModalDisplay_Rating}/>
              <ModalHeaderText>Rate Tutor:</ModalHeaderText>
            </div>
            <RatingBar
              editable={true}
              rating={this.state.tmpRating}
              updateBarRating={this.updateTmpRating}
            />
            <ModalContentText style={{marginTop: "20px"}}>
              <Button onClick={this.updateRating}>Rate</Button>
              <Button onClick={this.handleModalDisplay_Rating}>Cancel</Button>
            </ModalContentText>
          </ModalContent>
        </Modal>
      </GridContainer>
    );
  }
}
