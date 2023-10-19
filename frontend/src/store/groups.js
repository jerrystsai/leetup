// Action type constants
export const GET_GROUP = 'groups/GET_GROUP';
export const GET_ALL_GROUPS = 'groups/GET_ALL_GROUPS';

// Action creators
export const getAllGroups = () => ({
  type: GET_ALL_GROUPS,
});

// Thunk action creators
export const getAllGroupsThunk = () => async (dispatch) => {
  const responseJSON = await csrfFetch(`/groups`);

  if (response.ok) {
    const response = await responseJSON.json()
    dispatch(getAllGroups());
  } else {
    // console.log('error on response for remove report')
    // throw new Error('remove report')
  }

}

const groupsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_ALL_GROUPS:
      const groupsState = {};
      action.groups.forEach((report) => {
        groupsState[report.id] = report;
      });
      return groupsState;
    case RECEIVE_GROUP:
      return { ...state, [action.report.id]: action.report };
    case UPDATE_GROUP:
      return { ...state, [action.report.id]: action.report };
    case REMOVE_GROUP:
      const newState = { ...state };
      delete newState[action.reportId];
      return newState;
    default:
      return state;
  }
};

export default groupsReducer;
