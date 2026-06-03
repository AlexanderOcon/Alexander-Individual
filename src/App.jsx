import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Encabezado from "./components/navegacion/Encabezado";

import Inicio from "./views/Inicio";
import Categorias from "./views/Categorias";
import Catalogo from "./views/Catalogo";
import Productos from "./views/Productos";
import Empleados from "./views/Empleados";
import Clientes from "./views/Clientes";
import Ventas from "./views/Ventas";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import RutaProtegida from "./components/rutas/RutaProtegida";
import Pagina404 from "./views/Pagina404";

import "./App.css";

const AppContenido = () => {
  const location = useLocation();
  const esLogin = location.pathname === "/login";

  return (
    <>
      {!esLogin && <Encabezado />}

      <main
        className={
          esLogin ? "" : "margen-superior-main discosa-fondo"
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <RutaProtegida>
                <Inicio />
              </RutaProtegida>
            }
          />
          <Route
            path="/categorias"
            element={
              <RutaProtegida>
                <Categorias />
              </RutaProtegida>
            }
          />
          <Route
            path="/empleados"
            element={
              <RutaProtegida>
                <Empleados />
              </RutaProtegida>
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route
            path="/productos"
            element={
              <RutaProtegida>
                <Productos />
              </RutaProtegida>
            }
          />
          <Route
            path="/clientes"
            element={
              <RutaProtegida>
                <Clientes />
              </RutaProtegida>
            }
          />
          <Route
            path="/ventas"
            element={
              <RutaProtegida>
                <Ventas />
              </RutaProtegida>
            }
          />
          <Route path="*" element={<Pagina404 />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContenido />
    </Router>
  );
};

export default App;
