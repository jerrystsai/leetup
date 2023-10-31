import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import GroupDescription from '../GroupDescription';
import { loadGroupsThunk } from '../../store/groups';

const GroupsList = () => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect( () => {
    setIsLoaded(false);
    dispatch(loadGroupsThunk())
      .then( () => {setIsLoaded(true);} )
  }, [dispatch])

  const groupDescrips = useSelector(state => state.groups.groupDescrips) || {};

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
        { isLoaded ?
          (
          Object.values(groupDescrips).map( group =>
              <GroupDescription
                  key={group.id}
                  id={group.id}
                  name={group.numMembersame}
                  city={group.city}
                  state={group.state}
                  about={group.about}
                  numMembers={group.numMembers}
                  groupPrivate={group.private}
                  previewImage={group.previewImage} />
            )
          ) : (
            <>
            <p>Here</p>
            </>
          )
        }
      </ul>
    </>
  )
};

export default GroupsList;
