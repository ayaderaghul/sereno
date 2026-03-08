import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import API from "../api.js"
// Create context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => {
 return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [token, setToken] = useState(localStorage.getItem("token"));
 const [loading, setLoading] = useState(true);

 // Attach token automatically
 API.interceptors.request.use((config) => {
   if (token) {
     config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
 });

 // Restore user on refresh
 useEffect(() => {
   const loadUser = async () => {
     if (!token) {
       setLoading(false);
       return;
     }

     try {
       const res = await API.get("/auth/me");
       setUser(res.data);
     } catch (err) {
       logout();
     } finally {
       setLoading(false);
     }
   };

   loadUser();
 }, [token]);

 // Login
 const login = async (email, password) => {
   const res = await API.post("/auth/login", { email, password });

   setToken(res.data.token);
   setUser(res.data.user);

   localStorage.setItem("token", res.data.token);
 };

 // Register
 const register = async (data) => {
  console.log("data",data)
   const res = await API.post("/auth/register", data);

   setToken(res.data.token);
   setUser(res.data.user);

   localStorage.setItem("token", res.data.token);
 };

 // Logout
 const logout = () => {
   setUser(null);
   setToken(null);
   localStorage.removeItem("token");
 };

 const value = {
   user,
   token,
   login,
   register,
   logout,
   loading,
 };

 return (
   <AuthContext.Provider value={value}>
     {!loading && children}
   </AuthContext.Provider>
 );
};
