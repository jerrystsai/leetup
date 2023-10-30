import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import GroupDescription from '../GroupDescription';
import { loadGroupsThunk } from '../../store/groups';

const GroupsList = () => {
    const dispatch = useDispatch();

    const groups = useSelector(state => Object.values(state.groups));

    useEffect( () => {
      dispatch(loadGroupsThunk());
    }, [dispatch])

    return (
      <>
        <div className="feature-headline">
          <NavLink to="/events">Events</NavLink>
        </div>
        <div className="feature-headline">
          <NavLink className='active' to="/groups">Groups</NavLink>
        </div>
        <div className="comment">Groups in Leetup</div>
        <ul className="groupList">
          {groups && groups?.map( ({ id, organizerId, name, about, type, private: groupPrivate, city, state, createdAt, updatedAt, numMembers, previewImage }) => {
            return <GroupDescription id={id} name={name} city={city} state={state} about={about} numMembers={numMembers} groupPrivate={groupPrivate} previewImage={previewImage} />;
          } )}
        </ul>
      </>
    )
  };

export default GroupsList;
