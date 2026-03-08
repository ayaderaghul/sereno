import axios from "axios";


const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
});

console.log("process env", process.env.REACT_APP_API_URL)

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
    console.log("token in interceptor",token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }


  return config;
});


export default API;
