import { csrfFetch } from './csrf';

// Action type constants
export const LOAD_EVENTS = 'events/LOAD_EVENTS';
export const ADD_EVENT = 'events/ADD_EVENT';
export const EDIT_EVENT = 'events/EDIT_EVENT';
export const REMOVE_EVENT = 'events/REMOVE_EVENT';

// Action creators
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
export const loadEventsThunk = () => async (dispatch) => {
  const responseJSON = await fetch(`/events`);

  if (responseJSON.ok) {
    const response = await responseJSON.json()
    dispatch(loadEvents(response));
  }
  return responseJSON;
}

export const addEventThunk = (eventInfo) => async (dispatch) => {
  const responseJSON = await csrfFetch(`/events`, {
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
  const responseJSON = await csrfFetch(`/events/${eventInfo.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventInfo),
  });

  if (responseJSON.ok) {
    const response = await responseJSON.json()
    dispatch(editEvent(response));
  }
  return responseJSON;
}

export const removeEventThunk = (eventId) => async (dispatch) => {
  const responseJSON = await csrfFetch(`/events/${eventId}`, {
    method: 'DELETE',
  });

  if (responseJSON.ok) {
    const response = await responseJSON.json()
    dispatch(removeEvent(eventId));
  }
  return responseJSON;
}


// REDUCER
const initialState = {};

const eventsReducer = (state = initialState, action) => {
  const newState = {...state};

  switch (action.type) {
    case LOAD_EVENTS:
      action.payload.forEach((event) => {
        newState[event.id] = event;
      });
      return newState;
    case ADD_EVENT:
      return {...newState, [action.payload.id]: action.payload }
    case EDIT_EVENT:
      return {...newState, [action.payload.id]: action.payload }
    case REMOVE_EVENT:
      delete newState[action.payload];
      return newState;
    default:
      return state;
  }
};

export default eventsReducer;
