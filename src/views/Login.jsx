import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/login/FormularioLogin";
import {supabase } from "database/supabaseconfig";

const Login = () => {

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navegar = useNavigate();

  const estiloContenedor = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "linear-gradient(135deg, #FFDEE9, #B5FFFC)",
  overflow: "hidden",
  padding: "20px",
};

useEffect(() => {
  const usuarioGuardado = localStorage.getItem("Usuario-supabase");
  if (usuarioGuardado) {
    navegar("/");
  }
}, [navegar]);

const IniciarSesion = async () => {
  try{
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usuario,
      password: contrasena,
    });

    if (error) {
      setError("Usuario o contraseña incorrectos");
      return;
    }
    if (data.user) {
      localStorage.setItem("Usuario-supabase", usuario);
      navegar("/")
    }
  } catch (error) {
    setError("Error al conectar con el servidor. Inténtalo de nuevo.");
    console.error("Error en la solicitud de inicio de sesión:", error);
  }
};

}
export default Login;