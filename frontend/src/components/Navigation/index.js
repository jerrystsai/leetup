import { useSelector } from 'react-redux';
import { NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
// import { logoutSessionThunk } from '../../store/session';
import './Navigation.css';
import OpenModalButton from "../OpenModalButton";

import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';

const Navigation = ( {isLoaded} ) => {

  // const dispatch = useDispatch();
  const sessionUser = useSelector( state => state.session.user );
  // const dispatch = useDispatch();

  // const logout = (e) => {
  //   e.preventDefault();
  //   dispatch(logoutSessionThunk());
  // }

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
