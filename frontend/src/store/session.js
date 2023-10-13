import { csrfFetch } from './csrf';

/** Action Type Constants: */
export const SESSION_LOGIN = 'session/LOGIN';
export const SESSION_LOGOUT = 'session/LOGOUT';

/**  Action Creators: */
export const loginSession = (user) => ({
  type: SESSION_LOGIN,
  payload: user
});

export const logoutSession = () => ({
  type: SESSION_LOGOUT,
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
  );

  if (response.ok) {
    const responseJSON = await response.json();
    dispatch(loginSession(responseJSON.user))
    return responseJSON;
  } else {
    const invalidLogIn = await response.json();
    return invalidLogIn;
  }
}

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
