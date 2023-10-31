import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { loadGroupThunk, loadGroupEventsThunk } from '../../store/groups';

const GroupDetails = () => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const history = useHistory();

  const { id } = useParams();

  const groupDetails = useSelector(state => state.groups.groupDetails);
  const groupEvents = useSelector(state => state.groups.groupEvents);
  const currentDateTime = new Date();
  const upcomingEvents = groupEvents ? groupEvents[id].filter( event => event.startDate > currentDateTime) : [];
  const pastEvents = groupEvents ? groupEvents[id].filter( event => event.startDate <= currentDateTime) : [];
  const details = groupDetails[id];

  useEffect( () => {
    setIsLoaded(false);
    dispatch(loadGroupThunk(id));
    dispatch(loadGroupEventsThunk(id)).then( () => {setIsLoaded(true)} );
  }, [dispatch, id]);

  return (
    <>
      { isLoaded && (
      <>
        <div className="details-heading"></div>
          <div className="details-heading-left">
            <div className="details-breadcrumb"></div>
            <div className="details-image"></div>
          </div>
          <div className="details-heading-right">
            <div className="details-headline"><h3>{details.name}</h3></div>
            <div className="details-attributes"></div>
            <div className="details-cta"><button>Join this group</button></div>
          </div>
        <div className="details-descrip">
          <h3>Organizer</h3>
          <h4></h4>
          <h3>What we're about</h3>
          <h4></h4>
        </div>
        (
        <div className="details-events">
          <h3>Upcoming Events</h3>
          <h4></h4>
        </div>
        )
        <div className="details-events">
          <h3>Past Events</h3>
        </div>
      </>
      )}
    </>
  )
};

export default GroupDetails;
