import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import { loadGroupThunk, loadGroupEventsThunk } from '../../store/groups';
import EventDescription from '../EventDescription';

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
  let events, upcomingEvents, pastEvents;

  useEffect( () => {
    setIsLoaded(false);
    dispatch(loadGroupThunk(id))
      .then( () => dispatch(loadGroupEventsThunk(id)) )
      .then( () => {setIsLoaded(true)} );
  }, [dispatch, id]);

  if (isLoaded) {
    details = groupDetails[Number(id)];
    details.openness = (details.private === true ? 'private' : 'public');

    const events = groupEvents ? groupEvents[id] : [];
    for (let event of events) {
      event.startDateLiteral = new Date(event.startDate)
      event.venueStr = event.Venue ? `${event.Venue.city}, ${event.Venue.state}` : `virtual`;
    }
    console.log('events', events);

    const upcomingEvents = events.filter( event => new Date(event.startDate) > currentDateTime);
    upcomingEvents.sort( (a, b) =>  new Date(a.startDate) - new Date(b.startDate) )
    const pastEvents = events.filter( event => new Date(event.startDate) <= currentDateTime);
    pastEvents.sort( (a, b) => new Date(b.startDate) - new Date(a.startDate) )

    return (
      <>
        <div className="details-heading"></div>
          <div className="details-heading-left">
            <div className="details-breadcrumb"><NavLink to="/groups">Groups</NavLink></div>
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
        { upcomingEvents.length > 0 && (
          <div className="details-events">
            <h3>Upcoming Events {`(${upcomingEvents.length})`}</h3>
            <h4>
              {
              Object.values(upcomingEvents).map( event =>
              <EventDescription
                  key={event.id}
                  id={event.id}
                  previewImage={event.previewImage}
                  startDate={event.startDate}
                  name={event.name}
                  description={event.description}
                  venueStr={event.venueStr} />
              )}
            </h4>
          </div>
        )}
        { pastEvents.length > 0 && (
          <div className="details-events">
            <h3>Past Events {`(${pastEvents.length})`}</h3>
            <h4>
              {
              Object.values(pastEvents).map( event =>
              <EventDescription
                  key={event.id}
                  id={event.id}
                  previewImage={event.previewImage}
                  startDate={event.startDate}
                  name={event.name}
                  description={event.description}
                  venueStr={event.venueStr} />
              )}
            </h4>
          </div>
        )}
      </>
    )
  };

  return (
    <>
      <h3>Group Details are loading...</h3>
    </>
  )
};


export default GroupDetails;
