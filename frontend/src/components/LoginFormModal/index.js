import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSessionThunk } from '../../store/session';
import { useModal } from '../../context/Modal';

import './LoginForm.css';

const LoginFormModal = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const credentials = {email, password};
    return dispatch(loginSessionThunk(credentials))
    .then(closeModal)
    .catch(
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
        <label>
          Password:
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {errors.email && (<div className="errors">{errors.email}</div>)}
        <button type="submit">Log In</button>
      </form>
    </>
  );
}

export default LoginFormModal;
