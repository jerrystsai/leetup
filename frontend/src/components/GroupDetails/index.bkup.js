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

  const countUnits = (arr, singular, plural) => {
    if (arr) {
      if (arr.length !== 1) return `${arr.length} ${plural}`;
      else return `1 ${singular}`;
    } else {
      return `0 ${plural}`;
    }
  }

  const joinThisGroupCTA = () => {
    alert("Feature coming soon")
  }

  let details, openness;
  if (isLoaded) {
    details = groupDetails[Number(id)];
    details.openness = (details.private === true ? 'private' : 'public');
  }

  let events, upcomingEvents, pastEvents;
  if (isLoaded) {
    const events = groupEvents ? groupEvents[id] : [];
    console.log('Events', events);
    const upcomingEvents = events.filter( event => new Date(event.startDate) > currentDateTime);
    const pastEvents = events.filter( event => new Date(event.startDate) <= currentDateTime);

    const checkIt = events.map( event => {console.log('startDate', event.startDate)} );

    console.log(events.length, currentDateTime, upcomingEvents.length, pastEvents.length);
    console.log('startDates', typeof events[0].startDate, typeof events[1].startDate);
    console.log('startDates', events[0].startDate, events[1].startDate);
    console.log('pastEvents[0]', pastEvents[0]);
  }

  useEffect( () => {
    setIsLoaded(false);
    dispatch(loadGroupThunk(id))
      .then( () => dispatch(loadGroupEventsThunk(id)) )
      .then( () => {setIsLoaded(true)} );
  }, [dispatch, id]);

  console.log('groupDetails', groupDetails);

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
            <div className="details-attributes">
                <p>{details.city}, {details.state}</p>
                <p>{countUnits(events, 'event', 'events')} • {details.openness}</p>
                <p>Organized by {details.Organizer.firstName} {details.Organizer.lastName}</p>
            </div>
            <div className="details-cta"><button onClick={joinThisGroupCTA}>Join this group</button></div>
          </div>
        <div className="details-descrip">
          <h3>Organizer</h3>
          <h4>{details.Organizer.firstName} {details.Organizer.lastName}</h4>
          <h3>What we're about</h3>
          <h4>{details.about}</h4>
          <h4>{upcomingEvents}</h4>
        </div>
      </>
      )}
      { isLoaded && upcomingEvents && upcomingEvents.length > 0 && (
        <div className="details-events">
          <h3>Upcoming Events</h3>
          <h4>{upcomingEvents[0]}</h4>
        </div>
      )}
      { isLoaded && pastEvents && pastEvents.length > 0 && (
        <div className="details-events">
          <h3>Past Events</h3>
          <h4>{pastEvents}</h4>
        </div>
      )}
    </>
  )
};

export default GroupDetails;
