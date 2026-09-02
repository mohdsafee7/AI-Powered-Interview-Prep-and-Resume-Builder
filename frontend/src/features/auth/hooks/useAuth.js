import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context.jsx";
import { login, register, logout, getMe } from "../services/auth.api.js";

//this is a custom hook that provides authentication-related functionality to components that use it. 
// It allows components to access the authentication context and perform actions like login, register, logout, and get the current user.
export const useAuth = () => {

  const context = useContext(AuthContext); //useContext is a React hook that allows us to access the value of a context object.
  const {user, setUser, loading, setLoading} = context; //we are destructuring the context object to extract the user, setUser, loading, and setLoading values.


  const handleLogin = async ({email, password}) => {
    setLoading(true); //setLoading is a function that updates the loading state to true, indicating that a login operation is in progress.
    try{
      const data = await login({email, password}); //we are calling the login function from the auth.api.js file, passing in the email and password. This function makes an API request to log in the user.
      setUser(data.user); 
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false); //setLoading is called again to update the loading state to false, indicating that the login operation has completed.
    }

  }

  const handleRegister = async ({username, email, password}) => {
    setLoading(true);
    try{
      const data = await register({username, email, password});
      setUser(data.user);
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    setLoading(true);
    try{
      const data = await logout();
      setUser(null); //we are setting the user state to null, indicating that the user has logged out.
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

    useEffect(() => {

    const getAndSetUser = async () => {
      try {
          const data = await getMe(); //getMe is a function that likely makes an API call to retrieve the current user's information.
          setUser(data.user);
      }
      catch (err) {
        console.log(err);
      }
      finally{
        setLoading(false); //Once the user data is retrieved, we update the user state and set loading to false, indicating that the authentication operation is complete. 
      }
    }
    getAndSetUser();
  },[])

  return {user, loading, handleLogin, handleRegister, handleLogout }; //we are returning an object that contains the user, loading state, and the authentication-related functions. Components that use this hook can access these values and functions.
}