import React from "react";

const LayoutPagina = ({
  titulo,
  subtitulo,
  icono,
  acciones,
  herramientas,
  children,
}) => {
  return (
    <div className="pagina-discosa">
      <header className="pagina-encabezado">
        <div className="pagina-titulo-grupo">
          {icono && <i className={`bi ${icono} pagina-icono`} aria-hidden />}
          <div>
            <h1 className="pagina-titulo">{titulo}</h1>
            {subtitulo && <p className="pagina-subtitulo">{subtitulo}</p>}
          </div>
        </div>
        {acciones && <div className="pagina-acciones">{acciones}</div>}
      </header>

      {herramientas && (
        <div className="pagina-herramientas card shadow-sm">{herramientas}</div>
      )}

      <div className="pagina-contenido">{children}</div>
    </div>
  );
};

export default LayoutPagina;
