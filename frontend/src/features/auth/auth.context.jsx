import { createContext, useState, } from "react";

export const AuthContext = createContext(); //it means that we are creating a new context object called AuthContext. 
//This context will be used to share authentication-related data and functions across different components in the React application.

export const AuthProvider = ({ children }) => { //this is a component that provides the authentication context to its children components.
  const [user, setUser] = useState(null); //useState is a React hook that allows us to add state to functional components. Here, we are initializing the user state to null, indicating that no user is currently logged in.
  const [loading, setLoading] = useState(true); //loading state is used to indicate whether an authentication-related operation is in progress.



  return (
    <AuthContext.Provider value={{user, setUser, loading, setLoading}} >
      {children} 
    </AuthContext.Provider>
  )
}