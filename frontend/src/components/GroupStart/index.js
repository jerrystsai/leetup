import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import { addGroupThunk } from '../../store/groups';

const GroupStart = () => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const history = useHistory();

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cityState, setCityState] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [type, setType] = useState('In person');
  const [visibility, setVisibility] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const updateCityState = (e) => setCityState(e.target.value);
  const updateState = (e) => setState(e.target.value);
  const updateName = (e) => setName(e.target.value);
  const updateAbout = (e) => setAbout(e.target.value);
  const updateType = (e) => setType(e.target.value);
  const updateVisibiilty = (e) => setVisibility(e.target.value);
  const updateImageUrl = (e) => setImageUrl(e.target.value);

  const user = useSelector(state => state.session.user);

  const submitForm = async (e) => {
    setIsLoaded(false);
    e.preventDefault();
    const inputErrors = {}

    const requirementMessage = (stateVal, errProp) => {
      const capitalizeErrProp = errProp.slice(0,1).toUppercase() + errProp.slice(1);
      if (!stateVal) inputErrors[errProp] = `${capitalizeErrProp} is required`;
    }

    requirementMessage(city, 'city');
    requirementMessage(state, 'state');
    requirementMessage(name, 'name');
    requirementMessage(about, 'about');
    requirementMessage(type, 'type');
    requirementMessage(visibility, 'visibility');
    requirementMessage(imageUrl, 'imageUrl');

    if (Object.keys(inputErrors).length > 0) {
      setErrors(inputErrors);
      return;
    }

    const newGroupInfo = {
      name,
      about,
      type,
      private: visibility,
      city,
      state
    };

    const newGroup = await(dispatch(addGroupThunk(newGroupInfo)));

    setIsLoaded(true);

    if (newGroupInfo.errors) {
      setErrors(newGroup.errors);
    } else {
      history.push(`/groups/${newGroup.id}`);
    }

  };

  return (
    <>
      <div className="form-fields">
        <form className="group-start" onSubmit={submitForm}>
          <div className="form-fields-heading">First, set your group's location</div>
          <div className="form-fields-copy">Meetup groups meet locally, in person and online. We'll connect you with people in your area, and more can join you online</div>
          <label className="form-label" htmlFor="location">
           <input
             className="form-input"
             type="text"
             placeholder="City, STATE"
             required
             value={city}
             onChange={updateCityState}
           />
          </label>
          <div className="form-fields-heading">What will your group's name be?</div>
          <div className="form-fields-copy">Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.</div>
          <label className="form-label" htmlFor="name">
           <input
             className="form-input"
             type="text"
             placeholder="What is your group name?"
             required
             value={city}
             onChange={updateName}
           />
          </label>
        </form>
      </div>
    </>
  )

};


export default GroupStart;
