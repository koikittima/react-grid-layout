import React, { useState } from "react";
import { AuthContext } from "./auth-create-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (username) => {
    const checkUsers = {
      admin: { password: "admin", rowAction: "admin" },
      user: { password: "user", rowAction: "user" },
    };
    const userDetails = checkUsers[username.user_name];

    if (userDetails && username.password === userDetails.password) {
      username.rowAction = userDetails.rowAction;
      setUser(username);
      setIsLoggedIn(true);      
    } else {
      setUser(null);
      setIsLoggedIn(false);
      console.log('ww');
      
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
