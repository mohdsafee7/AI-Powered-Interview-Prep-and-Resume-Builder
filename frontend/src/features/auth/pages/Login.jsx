// import React from 'react'
import "../auth.form.scss" 
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'


const Login = () => {

  const {loading, handleLogin} = useAuth(); //we are using the useAuth hook to access the authentication context and functions. This allows us to perform login operations and manage the loading state.

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    handleLogin({email, password}); //we are calling the handleLogin function from the useAuth hook, passing in the email and password. This function will handle the login logic and update the user state accordingly.
    // Handle login logic here
  }

  if(loading){
    return (
      <main>
        <h1>Loading...</h1>
      </main>
    )
  }

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
            onChange={(e) => { setEmail(e.target.value) }}
            type="email" id="email" name="email" placeholder='Enter your email' />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
            onChange={(e) => { setPassword(e.target.value) }}
            type="password" id="password" name="password" placeholder='Enter your password' />
          </div>
          
          <button className='button primary-button'>Login</button>
          
        </form>

        <p>Don't have an Account? <Link to={"/register"}>Register</Link> </p>

      </div>
    </main>
  )
}

export default Login
