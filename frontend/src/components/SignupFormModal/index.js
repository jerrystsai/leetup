import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { userSignupThunk } from '../../store/session';
import './SignupForm.css';

const SignupFormModal = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      const signupInfo = {email, username, firstName, lastName, password};
      return dispatch(userSignupThunk(signupInfo))
        .then(closeModal)
        .catch(
          async (res) => {
            const data = await res.json();
            if (data && data.errors) setErrors(data.errors)
          }
        );
    }

    return setErrors({
      confirmPassword: "Confirm Password field must be the same as the Password field"
    })
  };

  return (
    <>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {errors.email && <div className="errors">{errors.email}</div>}
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        {errors.username && <div className="errors">{errors.username}</div>}
        <label>
          First name:
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        {errors.firstName && <div className="errors">{errors.firstName}</div>}
        <label>
          Last name:
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
        {errors.lastName && <div className="errors">{errors.lastName}</div>}
        <label>
          Password:
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {errors.password && <div className="errors">{errors.password}</div>}
        <label>
          Confirm password:
          <input
            type="text"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        {errors.confirmPassword && <div className="errors">{errors.confirmPassword}</div>}
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default SignupFormModal;
