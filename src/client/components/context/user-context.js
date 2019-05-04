import React from "react";

const defaultUser = {
  first_name: "",
  last_name: "",
  school: "",
  profile_picture: false,
  majors: [],
  minors: [],
  graduation_year: 2019,
  interests: [],
  phone: "",
  email: "",
  blurb: "",
  avgRating: 0,
  //rating: [],
  classes_tutor: [],
  classes_learn: [],
  profileURL: ""
};

export const UserContext = React.createContext({
  user: defaultUser,
  updateUser: () => {},
  loggedIn: () => false,
  active: false,
});
