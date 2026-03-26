import { useState } from "react";
import { BrowserRouter as Router,Routes, Route } from "react-router-dom";

import Encabezado from "./assets/components/navegacion/Encabezado";
import RutaProtegida from "./assets/components/rutas/RutaProtegida";
import Inicio from "./assets/views/Inicio";
import Categorias from "./assets/views/Categorias";
import Catalogo from "./assets/views/Catalogo";
import Productos from "./assets/views/Productos";
import Login from "./assets/views/Login";
import Pagina404 from "./assets/views/Pagina404";

import "./App.css";


const App = () => {

  return (

    <Router>

      <Encabezado />
      
      <main className="margen-superior-main">
        <Routes>

          <Route path="/login" element={<Login />} />

          <Route path="/" element={<RutaProtegida><Inicio/></RutaProtegida>} />
          <Route path="/categorias" element={<RutaProtegida><Categorias/></RutaProtegida>} />
          <Route path="/catalogo" element={<RutaProtegida><Catalogo/></RutaProtegida>} />
          <Route path="/productos" element={<RutaProtegida><Productos/></RutaProtegida>} />

          <Route path="*" element={<Pagina404 />} />

        </Routes>
      </main>
    </Router>
  );
}

export default App;