import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import { loadEventThunk } from '../../store/events';

const EventDetails = () => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const history = useHistory();
  const { id } = useParams();

  const eventDetails = useSelector(state => state.events.eventDetails);

  let details, openness;
  let events, upcomingEvents, pastEvents;

  useEffect( () => {
    setIsLoaded(false);
    dispatch(loadEventThunk(id))
      .then( () => {setIsLoaded(true)} );
  }, [dispatch, id]);

  if (isLoaded) {
    details = eventDetails[Number(id)];
    details.Group.openness = (details.Group.private === true ? 'private' : 'public');
    console.log(details);

    return (
      <>
        <div className="header">
          <div className="header-breadcrumb"><NavLink to="/events">Events</NavLink></div>
          <div className="header-name">{details.name}</div>
          <div className="header-organizer">Hosted by {`${details.Host.firstName} ${details.Host.lastName}`}</div>
        </div>
        <div className="details-heading"></div>
          <div className="details-heading-left">
            <div className="details-image"></div>
          </div>
          <div className="details-heading-right">
            <div className="event-group-info">
              <div className="event-group-image"><img className="event-group-img-image" alt={details.Group.name} src={details.EventImages.url} /></div>
              <div className="event-group-name">{details.Group.name}</div>
              <div className="event-group-openness">{details.Group.openness}</div>
            </div>
            <div className="details-event-attributes">
              <div className="details-event-attributes-timing">
                <div className="details-event-atributes-time">clock</div>
                <div className="details-event-start">START</div>
                <div className="details-event-start-time">{details.startDate}</div>
                <div className="details-event-start">END</div>
                <div className="details-event-start-time">{details.endDate}</div>
              </div>
              <div className="details-event-attributes-pricing">
                <div className="details-event-atributes-time">dollar sign</div>
                <div className="details-event-price">{details.price}</div>
              </div>
              <div className="details-event-attributes-typing">
                <div className="details-event-atributes-pin">pin</div>
                <div className="details-event-price">{details.type}</div>
              </div>
            </div>
          </div>
        <div className="details-descrip">
          <h3>Details</h3>
          <p>{details.description}</p>
        </div>
      </>
    )
  };

  return (
    <>
      <h3>event Details are loading...</h3>
    </>
  )
};


export default EventDetails;
