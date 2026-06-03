import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import LayoutPagina from "../components/layout/LayoutPagina";

const Pagina404 = () => {
  const navigate = useNavigate();

  return (
    <LayoutPagina titulo="Página no encontrada" icono="bi-compass">
      <div className="pagina-404">
        <i className="bi bi-exclamation-triangle pagina-404-icono" aria-hidden />
        <h1>404</h1>
        <p className="text-muted mb-4">
          La ruta que buscas no existe o fue movida.
        </p>
        <Button variant="primary" className="btn-discosa" onClick={() => navigate("/")}>
          <i className="bi bi-house me-2" />
          Volver al inicio
        </Button>
      </div>
    </LayoutPagina>
  );
};

export default Pagina404;
