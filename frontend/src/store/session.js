import { csrfFetch } from './csrf';

/** Action Type Constants: */
export const SESSION_LOGIN = 'session/LOGIN';
export const SESSION_MAINTAIN = 'session/MAINTAIN';
export const SESSION_LOGOUT = 'session/LOGOUT';

/**  Action Creators: */
export const loginSession = (user) => ({
  type: SESSION_LOGIN,
  payload: user
});

export const logoutSession = () => ({
  type: SESSION_LOGOUT,
});

export const maintainSession = () => ({
  type: SESSION_MAINTAIN,
});


// /** Thunk Action Creators: */
export const loginSessionThunk = (payload) => async (dispatch) => {
  // payload is expected to be: {"credential": credentialExample, "password": passwordExample}
  const { email, password } = payload;

  const response = await csrfFetch(
    // `/api/session`, {
    `/api/login`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    }
  ).then( responseJSON => responseJSON.json() );

  dispatch(loginSession(response.user))
  return response;
}

export const maintainSessionThunk = () => async (dispatch) => {
  const responseJSON = await csrfFetch(
    // `/api/session`
    `/api/login`
  );
  const response = await responseJSON.json();
  dispatch(loginSession(response.user))
  return responseJSON;
}

export const userSignupThunk = (payload) => async (dispatch) => {
  // payload is expected to be: {"credential": credentialExample, "password": passwordExample}
  const { username, firstName, lastName, email, password } = payload;

  const response = await csrfFetch(
    `/api/users`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username, firstName, lastName, email, password
      })
    }
  ).then( responseJSON => responseJSON.json() );

  dispatch(loginSession(response.user))
  return response;
}


// REDUCER

const sessionReducer = (state = {user: null}, action) => {
  let newState;

  switch (action.type) {
    case SESSION_LOGIN:
      newState = {...state};
      newState.user = action.payload;
      return newState;
    case SESSION_LOGOUT:
      newState = {...state};
      newState.user = null;
      return newState;
    default:
      return state;
  }
};

export default sessionReducer;

// {
//   user: {
//     id,
//     email,
//     username,
//     firstName,
//     lastName,
//     createdAt,
//     updatedAt
//   }
// }
