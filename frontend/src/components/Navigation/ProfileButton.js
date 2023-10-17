// import { useState } from "react";
import { useDispatch } from 'react-redux';
import { logoutSessionThunk } from '../../store/session';

const ProfileButton = ( {user} ) => {
  const dispatch = useDispatch();

  const logout = (e) => {
    e.preventDefault();
    dispatch(logoutSessionThunk());
  }

  // const ulClassName = "profile-dropdown";

  return (
    <>
      <h4>HERE HERE</h4>
      <button style={ {color: "orange", fontSize: "50px"} }>
        <i className="fa-solid fa-address-card"></i>
      </button>
      <ul className="profile-dropdown">
        <li>{user.username}</li>
        <li>{user.firstName} {user.lastName}</li>
        <li>{user.email}</li>
        <li>
          <button onClick={logout}>Log Out</button>
        </li>
      </ul>
    </>
  );
};

export default ProfileButton;
