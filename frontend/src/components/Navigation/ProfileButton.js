import { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import { logoutSessionThunk } from '../../store/session';

const ProfileButton = ( {user} ) => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  }

  const logout = (e) => {
    e.preventDefault();
    dispatch(logoutSessionThunk());
  }

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  useEffect( () => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  return (
    <>
      <button onClick={openMenu} style={ {color: "orange", fontSize: "50px"} }>
        <i className="fa-solid fa-address-card"></i>
      </button>
      <ul className={ulClassName} ref={ulRef}>
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
