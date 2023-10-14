import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { loginSessionThunk } from '../../store/session';
import './LoginForm.css';

const LoginFormPage = () => {

  const dispatch = useDispatch();
  const sessionUser = useSelector( state => state.session.user );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Redirect to='/' />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const credentials = {email, password};
    return dispatch(loginSessionThunk(credentials)).catch(
      async (res) => {
        const data = await res.json();
        if (data && data.errors) setErrors(data.errors)
      }
    );
  };


  return (
    <>
      <h2>Log In</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <div className="errors">{errors.email}</div>
        <label>
          Password:
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="errors">{errors.password}</div>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default LoginFormPage;
