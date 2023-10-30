import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { loadGroupThunk, loadGroupEventsThunk } from '../../store/groups';

const GroupDetails = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { id } = useParams();

  const group = useSelector(state => state.groups[id]);

  useEffect( () => {
    dispatch(loadGroupThunk(id))
    dispatch(loadGroupEventsThunk(id))
  }, [dispatch, id]);


  return (
    <>
      <div className="details-heading"></div>
        <div className="details-heading-left">
          <div className="details-breadcrumb"></div>
          <div className="details-image"></div>
        </div>
        <div className="details-heading-right">
          <div className="details-headline"><h3></h3></div>
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
  )
};

export default GroupDetails;
