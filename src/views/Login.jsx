import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/login/FormularioLogin";
import { supabase } from "../database/supabaseconfig";
import logo from "../assets/logo.png";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navegar = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario-supabase");
    if (usuarioGuardado) {
      navegar("/");
    }
  }, [navegar]);

  const IniciarSesion = async (e) => {
    e?.preventDefault();
    setCargando(true);
    setError("");
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: usuario,
        password: contrasena,
      });

      if (authError) {
        setError("Usuario o contraseña incorrectos");
        return;
      }
      if (data.user) {
        localStorage.setItem("usuario-supabase", usuario);
        navegar("/");
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Inténtalo de nuevo.");
      console.error("Error en la solicitud de inicio de sesión:", err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-pantalla discosa-fondo">
      <aside className="login-marca">
        <img src={logo} alt="Discosa" className="login-marca-logo" />
        <h1>Discosa</h1>
        <p>Gestión de ventas, inventario y catálogo de productos de belleza.</p>
      </aside>

      <div className="login-formulario-panel">
        <FormularioLogin
          usuario={usuario}
          contrasena={contrasena}
          error={error}
          cargando={cargando}
          setUsuario={setUsuario}
          setContrasena={setContrasena}
          IniciarSesion={IniciarSesion}
        />
      </div>
    </div>
  );
};

export default Login;
