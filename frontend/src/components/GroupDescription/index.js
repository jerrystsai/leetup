import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const GroupDescription = ( { name, id, city, state, about, numMembers, groupPrivate, previewImage } ) => {
  return (
    <li className="group-descrip">
      <NavLink className="group-descrip-link" to={`/groups/${id}`}>
        <img className="group-descrip-image" alt="group" src={previewImage} />
        <h2 className="group-descrip-title">{name}</h2>
        <h3 className="group-descrip-location">{city}, {state}</h3>
        <p className="group-descrip-about">{about}</p>
        <h3 className="">{numMembers === 1 ? '1 member' : `${numMembers} members`} • {groupPrivate ? 'Private' : 'Public'}</h3>
      </NavLink>
    </li>
  )
};

export default GroupDescription;
