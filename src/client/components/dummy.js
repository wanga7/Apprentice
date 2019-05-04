import React from 'react';
import { Cart } from './cart.js';
import { SearchBar } from "./searchBar";
import { TutorList } from "./tutor-list";
import { NavBar } from "./navbar";
import { RatingBar } from "./rating-bar"

// replace the Dummy function with your components
//  in each route
export const Dummy = () => {
  return <div>
    <RatingBar editable={false} rating={3}/>
    <RatingBar editable={true} rating={1}/>
  </div>;
};
