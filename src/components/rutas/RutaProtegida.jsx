import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children }) => {
  const usuario = localStorage.getItem('usuario-supabase');
  if (!usuario) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default RutaProtegida;
