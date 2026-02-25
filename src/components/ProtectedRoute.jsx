import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // check token

  if (!token) {
    return <Navigate to="/login" replace />; // redirect if no token
  }

  return children;
};

export default ProtectedRoute;