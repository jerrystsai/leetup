import { csrfFetch } from './csrf';

// Action type constants
export const LOAD_EVENT = 'events/LOAD_EVENT';
export const LOAD_EVENTS = 'events/LOAD_EVENTS';
export const ADD_EVENT = 'events/ADD_EVENT';
export const EDIT_EVENT = 'events/EDIT_EVENT';
export const REMOVE_EVENT = 'events/REMOVE_EVENT';

// Action creators
export const loadEvent = (event) => ({
  type: LOAD_EVENT,
  payload: event,
});

export const loadEvents = (events) => ({
  type: LOAD_EVENTS,
  payload: events,
});

export const addEvent = (newEvent) => ({
  type: ADD_EVENT,
  payload: newEvent
});

export const editEvent = (editedEvent) => ({
  type: EDIT_EVENT,
  payload: editedEvent
});

export const removeEvent = (deletedEventId) => ({
  type: REMOVE_EVENT,
  payload: deletedEventId
});


// Thunk action creators
export const loadEventThunk = (eventId) => async (dispatch) => {
  const responseJSON = await fetch(`/api/events/${eventId}`);

  if (responseJSON.ok) {
    const event = await responseJSON.json();
    dispatch(loadEvent(event));
    return event;
  } else {
    const notOkResponse = await responseJSON.json();
    if (notOkResponse.errors) {
      return { errors: notOkResponse.errors };
    }
  }
}

export const loadEventsThunk = () => async (dispatch) => {
  const responseJSON = await fetch(`/api/events`);

  if (responseJSON.ok) {
    const { Events: events } = await responseJSON.json();

    dispatch(loadEvents(events));
  }
  return responseJSON;
}

export const addEventThunk = (eventInfo) => async (dispatch) => {
  const responseJSON = await csrfFetch(`/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventInfo),
  });

  if (responseJSON.ok) {
    const response = await responseJSON.json()
    dispatch(addEvent(response));
  }
  return responseJSON;
}

export const editEventThunk = (eventInfo) => async (dispatch) => {
  const responseJSON = await csrfFetch(`/api/events/${eventInfo.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventInfo),
  });

  if (responseJSON.ok) {
    const event = await responseJSON.json();
    console.log('HERE HERE ', event);
    dispatch(editEvent(event));
    return event;
  } else {
    const notOkResponse = await responseJSON.json();
    if (notOkResponse.errors) {
      return { errors: notOkResponse.errors };
    }
  }
}

export const removeEventThunk = (eventId) => async (dispatch) => {
  const responseJSON = await csrfFetch(`/api/events/${eventId}`, {
    method: 'DELETE',
  });

  // Success does not return a event, I believe
  if (responseJSON.ok) {
    dispatch(removeEvent(eventId));
    return eventId;
  } else {
    const notOkResponse = await responseJSON.json();
    if (notOkResponse.errors) {
      return { errors: notOkResponse.errors };
    }
  }

}


// REDUCER
const initialState = {};

const eventsReducer = (state = initialState, action) => {
  const newState = {...state};

  switch (action.type) {
    case LOAD_EVENT:
      console.log('HERE AT LOAD_EVENT');
      return {
        ...newState,
        eventDetails: { ...newState.eventDetail, [action.payload.id]: action.payload }
      };
    case LOAD_EVENTS:
      console.log('HERE AT LOAD_EVENTS');
      const eventDescrips = {};
      action.payload.forEach((event) => {
        eventDescrips[event.id] = event;
      });
      newState.eventDescrips = eventDescrips;
      console.log('newState.eventDescrips', newState.eventDescrips)
      return newState;
    case ADD_EVENT:
      return {...newState,
        eventDescrips: { [action.payload.id]: action.payload }
      };
    case EDIT_EVENT:
      return {...newState,
        eventDescrips: { [action.payload.id]: action.payload }
      };
    case REMOVE_EVENT:
      if (newState.eventDescrips[action.payload] )delete newState.eventDescrips[action.payload];
      if (newState.eventDetails[action.payload] )delete newState.eventDetails[action.payload];
      return newState;
    default:
      return state;
  }
};

export default eventsReducer;
