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
      <div className="nav-credentials">
        <ProfileButton user={sessionUser} />
        {/* <button onClick={logout}>Log Out</button> */}
      </div>
    );
  } else {
    sessionLinks = (
      <div className="nav-credentials">
        <OpenModalButton
          buttonText='Log In'
          modalComponent={<LoginFormModal />}
        />
        <OpenModalButton
          buttonText='Sign Up'
          modalComponent={<SignupFormModal />}
        />
      </div>
    );
  }

  return (
    <div className="nav">
      <div className="nav-logo">
        <NavLink exact to="/"><img src="./images/leetup-logo.png" alt="Leetup Home" height="30px" /></NavLink>
      </div>
      {isLoaded && sessionLinks}
    </div>
  );
}

export default Navigation;
