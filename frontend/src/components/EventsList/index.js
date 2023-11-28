import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import EventDescription from '../EventDescription';
import { loadEventsThunk } from '../../store/events';

const EventsList = () => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect( () => {
    setIsLoaded(false);
    dispatch(loadEventsThunk())
      .then( () => {console.log('HERE IT IS');} )
      .then( () => {setIsLoaded(true);} )
      .then( () => {console.log('USE EFFECT RAN')})
  }, [dispatch])

  const eventDescrips = useSelector(state => state.events.eventDescrips) || {};
  console.log('eventDescrips', eventDescrips);

  let events;
  if (isLoaded) {
    events = Object.values(eventDescrips);
    for (let event of events) {
      event.startDateLiteral = new Date(event.startDate)
      event.venueStr = event.Venue ? `${event.Venue.city}, ${event.Venue.state}` : `virtual`;
    }
    events.sort( (a, b) =>  new Date(b.startDate) - new Date(a.startDate) )

    return (
      <>
        <div className="feature-headline">
          <NavLink className='active' to="/events">Events</NavLink>
        </div>
        <div className="feature-headline">
          <NavLink to="/groups">Groups</NavLink>
        </div>
        <div className="comment">Events in Leetup</div>
        <ul className="eventList">
            {
            events.map( event =>
            <EventDescription
                key={event.id}
                id={event.id}
                previewImage={event.previewImage}
                startDate={event.startDate}
                name={event.name}
                description={event.description}
                venueStr={event.venueStr} />
              )
            }
        </ul>
      </>
    )
  };

  return (
    <h3>Events loading...</h3>
  )

}

export default EventsList;
