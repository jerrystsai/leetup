import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const EventDescription = ( { id, previewImage, startDate, name, description, venueStr } ) => {

  return (
    <li className="event-descrip">
      <NavLink className="event-descrip-link" to={`/events/${id}`}>
        <img className="event-descrip-image" alt="event" src={previewImage} />
        <h2 className="event-descrip-date">{startDate}</h2>
        <h2 className="event-descrip-title">{name}</h2>
        <h4 className="event-descrip-location">{venueStr}</h4>
        <h4 className="event-descrip-description">{description}</h4>
      </NavLink>
    </li>
  )
};

export default EventDescription;
