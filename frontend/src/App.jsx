import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";


// Pages
import Login from "./pages/LoginPage";
import Sereno from "./pages/HomePage";

// 🔐 Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();


  if (loading) return <div>Loading...</div>;


  if (!user) {
    return <Navigate to="/login" replace />;
  }


  return children;
};





function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />


      {/* Protected Routes */}
     


      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Sereno />
          </ProtectedRoute>
        }
      />


    
    </Routes>
  );
}


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;