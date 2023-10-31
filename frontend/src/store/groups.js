import { csrfFetch } from './csrf';

// Action type constants
export const LOAD_GROUP = 'groups/LOAD_GROUP';
export const LOAD_GROUP_EVENTS = 'groups/LOAD_GROUP_EVENTS';
export const LOAD_GROUPS = 'groups/LOAD_GROUPS';
export const ADD_GROUP = 'groups/ADD_GROUP';
export const EDIT_GROUP = 'groups/EDIT_GROUP';
export const REMOVE_GROUP = 'groups/REMOVE_GROUP';

// Action creators
export const loadGroup = (group) => ({
  type: LOAD_GROUP,
  payload: group,
});

export const loadGroupEvents = (normEvents) => ({
  type: LOAD_GROUP_EVENTS,
  payload: normEvents,
});

export const loadGroups = (groups) => ({
  type: LOAD_GROUPS,
  payload: groups,
});

export const addGroup = (newGroup) => ({
  type: ADD_GROUP,
  payload: newGroup
});

export const editGroup = (editedGroup) => ({
  type: EDIT_GROUP,
  payload: editedGroup
});

export const removeGroup = (deletedGroupId) => ({
  type: REMOVE_GROUP,
  payload: deletedGroupId
});


// Thunk action creators
export const loadGroupThunk = (groupId) => async (dispatch) => {
  const responseJSON = await fetch(`/api/groups/${groupId}`);

  console.log('HERE AT LOAD GROUP THUNK id=', groupId);

  if (responseJSON.ok) {
    const group = await responseJSON.json();
    dispatch(loadGroup(group));
    return group;
  } else {
    const notOkResponse = await responseJSON.json();
    if (notOkResponse.errors) {
      return { errors: notOkResponse.errors };
    }
  }
}

export const loadGroupEventsThunk = (groupId) => async (dispatch) => {
  const responseJSON = await fetch(`/api/groups/${groupId}/events`);

  if (responseJSON.ok) {
    const { Events: groupEvents} = await responseJSON.json();
    const normGroupEvents = { id: groupId, events: groupEvents };
    dispatch(loadGroupEvents(normGroupEvents));
    return normGroupEvents;
  } else {
    const notOkResponse = await responseJSON.json();
    if (notOkResponse.errors) {
      return { errors: notOkResponse.errors };
    }
  }
}

export const loadGroupsThunk = () => async (dispatch) => {
  const responseJSON = await fetch(`/api/groups`);

  if (responseJSON.ok) {
    const { Groups: groups } = await responseJSON.json();

    dispatch(loadGroups(groups));
  }
  return responseJSON;
}

export const addGroupThunk = (groupInfo) => async (dispatch) => {
  const responseJSON = await csrfFetch(`/api/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(groupInfo),
  });

  if (responseJSON.ok) {
    const response = await responseJSON.json()
    dispatch(addGroup(response));
  }
  return responseJSON;
}

export const editGroupThunk = (groupInfo) => async (dispatch) => {
  const responseJSON = await csrfFetch(`/api/groups/${groupInfo.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(groupInfo),
  });

  if (responseJSON.ok) {
    const group = await responseJSON.json();
    console.log('HERE HERE ', group);
    dispatch(editGroup(group));
    return group;
  } else {
    const notOkResponse = await responseJSON.json();
    if (notOkResponse.errors) {
      return { errors: notOkResponse.errors };
    }
  }
}

export const removeGroupThunk = (groupId) => async (dispatch) => {
  const responseJSON = await csrfFetch(`/api/groups/${groupId}`, {
    method: 'DELETE',
  });

  // Success does not return a group, I believe
  if (responseJSON.ok) {
    dispatch(removeGroup(groupId));
    return groupId;
  } else {
    const notOkResponse = await responseJSON.json();
    if (notOkResponse.errors) {
      return { errors: notOkResponse.errors };
    }
  }

}


// REDUCER
const initialState = {};

const groupsReducer = (state = initialState, action) => {
  const newState = {...state};

  switch (action.type) {
    case LOAD_GROUP:
      console.log('HERE AT LOAD_GROUP');
      return {
        ...newState,
        groupDetails: { ...newState.groupDetail, [action.payload.id]: action.payload }
      };
    case LOAD_GROUPS:
      console.log('HERE AT LOAD_GROUPS');
      const groupDescrips = {};
      action.payload.forEach((group) => {
        groupDescrips[group.id] = group;
      });
      newState.groupDescrips = groupDescrips;
      return newState;
    case LOAD_GROUP_EVENTS:
      console.log('HERE AT LOAD_GROUP_EVENTS');
      return {
        ...newState,
        groupEvents: { ...newState.groupEvents, [action.payload.id]: action.payload.events }
      };
    case ADD_GROUP:
      return {...newState,
        groupDescrips: { [action.payload.id]: action.payload }
      };
    case EDIT_GROUP:
      return {...newState,
        groupDescrips: { [action.payload.id]: action.payload }
      };
    case REMOVE_GROUP:
      if (newState.groupDescrips[action.payload] )delete newState.groupDescrips[action.payload];
      if (newState.groupDetails[action.payload] )delete newState.groupDetails[action.payload];
      return newState;
    default:
      return state;
  }
};

export default groupsReducer;
