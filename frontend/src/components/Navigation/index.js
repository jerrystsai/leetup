import { NavLink } from "react-router-dom";
import { useSelector } from 'react-redux';
import './Navigation.css';

import ProfileButton from "./ProfileButton";
import OpenModalButton from "../OpenModalButton";
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';

const Navigation = ( { isLoaded } ) => {

  const sessionUser = useSelector( state => state.session.user );

  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <li>
        <ProfileButton user={sessionUser} />
        {/* <button onClick={logout}>Log Out</button> */}
      </li>
    );
  } else {
    sessionLinks = (
      <li>
        <OpenModalButton
          buttonText='Log In'
          modalComponent={<LoginFormModal />}
        />
        <OpenModalButton
          buttonText='Sign Up'
          modalComponent={<SignupFormModal />}
        />
      </li>
    );
  }

  return (
    <ul>
      <li>
        <NavLink exact to="/">Home</NavLink>
      </li>
      {isLoaded && sessionLinks}
    </ul>
  );
}

export default Navigation;
