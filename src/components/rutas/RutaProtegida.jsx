import React from "react";
import { Navigate } from "react-router-dom";

const RutaProtregida = ({ children }) => {

  const estaLogeado= !! localStorage.getItem("usuario-supabase");

  console.log("usario Autenticado" estaLogeado);
    return estaLogeado ? children : <Navigate to="/login" replace />;
};

export default RutaProtregida;
