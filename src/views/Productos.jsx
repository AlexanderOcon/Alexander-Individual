import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import TablaProductos from "../components/productos/TablaProductos";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import Paginacion from "../components/ordenamiento/Paginacion";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import TarjetaProducto from "../components/productos/TarjetasProductos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    archivo: null,
  });

  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5); // Registros por página
  const [paginaActual, establecerPaginaActual] = useState(1);

  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina,
  );

  const [productoEditar, setProductoEditar] = useState({
    id_producto: "",
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    url_imagen: "",
    archivo: null,
  });

  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoProducto((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.)");
    }
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setProductosFiltrados(productos);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = productos.filter((prod) => {
        const nombre = prod.nombre_producto?.toLowerCase() || "";
        const descripcion = prod.descripcion_producto?.toLowerCase() || "";
        const precio = prod.precio_venta?.toString() || "";

        return (
          nombre.includes(textoLower) ||
          descripcion.includes(textoLower) ||
          precio.includes(textoLower)
        );
      });
      setProductosFiltrados(filtrados);
    }
  }, [textoBusqueda, productos]);

  useEffect(() => {
    const totalPaginas = Math.max(
      1,
      Math.ceil((productosFiltrados.length || 0) / registrosPorPagina),
    );
    if (paginaActual > totalPaginas) {
      establecerPaginaActual(1);
    }
  }, [productosFiltrados, registrosPorPagina, paginaActual]);

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("Categorias")
        .select("*")
        .order("id_categoria", { ascending: true });
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar categorias:", err);
    }
  };

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("Productos")
        .select("*")
        .order("id_producto", { ascending: true });
      if (error) throw error;
      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setCargando(false);
    }
  };

  const agregarProducto = async () => {
    try {
      if (
        !nuevoProducto.nombre_producto.trim() ||
        !nuevoProducto.categoria_producto ||
        !nuevoProducto.precio_venta ||
        !nuevoProducto.archivo
      ) {
        setToast({
          mostrar: true,
          mensaje:
            "Completa los campos obligatorios (nombre, categoría, precio e imagen)",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModal(false);

      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes_productos")
        .upload(nombreArchivo, nuevoProducto.archivo, {});

      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from("imagenes_productos")
        .getPublicUrl(nombreArchivo);
      const urlPublica = urlData.publicUrl;

      const { error } = await supabase.from("Productos").insert([
        {
          nombre_producto: nuevoProducto.nombre_producto,
          descripcion_producto: nuevoProducto.descripcion_producto || null,
          categoria_producto: nuevoProducto.categoria_producto,
          precio_venta: parseFloat(nuevoProducto.precio_venta),
          url_imagen: urlPublica,
        },
      ]);

      if (error) throw error;

      // Recargar la lista de productos
      await cargarProductos();

      setNuevoProducto({
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        archivo: null,
      });

      setToast({
        mostrar: true,
        mensaje: "Producto registrado correctamente",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al agregar producto:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al registrar producto",
        tipo: "error",
      });
    }
  };

  const abrirModalEdicion = (producto) => {
    setProductoEditar({
      id_producto: producto.id_producto,
      nombre_producto: producto.nombre_producto ?? producto.nombre ?? "",
      descripcion_producto:
        producto.descripcion_producto ?? producto.descripcion ?? "",
      categoria_producto:
        producto.categoria_producto ?? producto.categoria ?? "",
      precio_venta: producto.precio_venta ?? producto.precio ?? "",
      url_imagen: producto.url_imagen ?? producto.imagen ?? "",
      archivo: null,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivoEdicion = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setProductoEditar((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.)");
    }
  };

  const actualizarProducto = async () => {
    try {
      if (
        !productoEditar.nombre_producto.trim() ||
        !productoEditar.categoria_producto ||
        !productoEditar.precio_venta
      ) {
        setToast({
          mostrar: true,
          mensaje: "Complete los campos obligatorios",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModalEdicion(false);

      let urlPublica = productoEditar.url_imagen;

      if (productoEditar.archivo) {
        const nombreArchivo = `${Date.now()}_${productoEditar.archivo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("imagenes_productos")
          .upload(nombreArchivo, productoEditar.archivo, {});
        if (uploadError) throw uploadError;

        const { data: urlData } = await supabase.storage
          .from("imagenes_productos")
          .getPublicUrl(nombreArchivo);
        urlPublica = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("Productos")
        .update({
          nombre_producto: productoEditar.nombre_producto,
          descripcion_producto: productoEditar.descripcion_producto || null,
          categoria_producto: productoEditar.categoria_producto,
          precio_venta: parseFloat(productoEditar.precio_venta),
          url_imagen: urlPublica,
        })
        .eq("id_producto", productoEditar.id_producto)
        .select();

      if (error) throw error;

      await cargarProductos();
      setToast({
        mostrar: true,
        mensaje: "Producto actualizado correctamente",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al actualizar producto",
        tipo: "error",
      });
    }
  };

  const eliminarProducto = async () => {
    if (!productoAEliminar) return;
    try {
      setMostrarModalEliminacion(false);
      const { error } = await supabase
        .from("Productos")
        .delete()
        .eq("id_producto", productoAEliminar.id_producto)
        .select();

      if (error) throw error;

      await cargarProductos();
      setToast({
        mostrar: true,
        mensaje: `Producto "${productoAEliminar.nombre_producto}" eliminado`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al eliminar producto",
        tipo: "error",
      });
    }
  };

  const generarPDFProducto = (producto) => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text("Reporte de Producto", 14, 20);

      // Línea decorativa
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.5);
      doc.line(14, 25, 195, 25);

      let yPosition = 35;

      // Imagen del producto
      if (producto.url_imagen) {
        try {
          doc.addImage(producto.url_imagen, "JPEG", 14, yPosition, 50, 50);
          yPosition += 55;
        } catch (err) {
          console.error("Error al cargar imagen:", err);
          yPosition += 10;
        }
      }

      // Información del producto
      doc.setFontSize(12);
      doc.setFont(undefined, "normal");

      autoTable(doc, {
        startY: yPosition,
        head: [["Campo", "Valor"]],
        body: [
          ["ID", producto.id_producto],
          ["Nombre", producto.nombre_producto],
          ["Descripción", producto.descripcion_producto || "N/A"],
          ["Categoría", producto.categoria_producto],
          ["Precio", `$${producto.precio_venta}`],
        ],
      });

      // Descargar PDF
      doc.save(`producto_${producto.id_producto}.pdf`);

      setToast({
        mostrar: true,
        mensaje: "PDF generado correctamente",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al generar PDF:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al generar PDF",
        tipo: "error",
      });
    }
  };

  const generarPDFGeneralProductos = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Título principal
      doc.setFontSize(20);
      doc.setFont(undefined, "bold");
      doc.text("Catálogo de Productos", 14, 20);

      // Fecha de generación
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`Generado: ${fecha}`, 14, 28);
      doc.text(`Total de productos: ${productos.length}`, 14, 34);

      // Línea decorativa
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.5);
      doc.line(14, 38, 195, 38);

      let yPosition = 45;
      const pageHeight = doc.internal.pageSize.height;

      // Recorrer cada producto
      for (let i = 0; i < productos.length; i++) {
        const producto = productos[i];

        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        // Nombre del producto en negrita
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text(`${producto.nombre_producto}`, 14, yPosition);
        yPosition += 6;

        // Agregar imagen si existe
        if (producto.url_imagen) {
          try {
            doc.addImage(producto.url_imagen, "JPEG", 14, yPosition, 45, 35);
          } catch (err) {
            console.error("Error al cargar imagen:", err);
          }
        }

        // Información al lado de la imagen
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");

        const infoX = producto.url_imagen ? 65 : 14;

        doc.text(`ID: ${producto.id_producto}`, infoX, yPosition);
        doc.text(
          `Categoría: ${producto.categoria_producto}`,
          infoX,
          yPosition + 6,
        );
        doc.text(`Precio: $${producto.precio_venta}`, infoX, yPosition + 12);

        // Descripción con saltos de línea
        const descLines = doc.splitTextToSize(
          `Descripción: ${producto.descripcion_producto || "N/A"}`,
          130 - infoX + 14,
        );
        doc.text(descLines, infoX, yPosition + 18);

        // Línea separadora
        yPosition = Math.max(
          yPosition + 40,
          yPosition + descLines.length * 4 + 20,
        );
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(14, yPosition, 195, yPosition);
        yPosition += 5;
      }

      // Descargar PDF
      doc.save(`Catalogo_Productos_${ahora.getTime()}.pdf`);

      setToast({
        mostrar: true,
        mensaje: "Catálogo de productos descargado correctamente",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al generar PDF general:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al generar catálogo de productos",
        tipo: "error",
      });
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={12} sm={4} md={4} lg={4} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bag-heart-fill me-2"></i> Productos
          </h3>
        </Col>

        <Col xs={12} sm={8} md={8} lg={8} className="text-end mt-2 mt-sm-0">
          <Button
            onClick={() => generarPDFGeneralProductos()}
            size="md"
            variant="success"
            className="me-2"
            disabled={productos.length === 0}
          >
            <i className="bi-file-earmark-pdf me-2"></i>
            <span className="d-none d-sm-inline">Descargar PDF</span>
          </Button>
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Producto</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, descripción o precio..."
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12} sm={12} md={12} className="d-lg-none">
          <TarjetaProducto
            productos={productosFiltrados}
            categorias={categorias}
            abrirModalEdicion={abrirModalEdicion}
            abrirModalEliminacion={abrirModalEliminacion}
          />
        </Col>
      </Row>

      <Row>
        <Col className="d-none d-lg-block">
          <TablaProductos
            productos={productosFiltrados.slice(
              (paginaActual - 1) * registrosPorPagina,
              paginaActual * registrosPorPagina,
            )}
            categorias={categorias}
            cargando={cargando}
            abrirModalEdicion={abrirModalEdicion}
            abrirModalEliminacion={abrirModalEliminacion}
            generarPDFProducto={generarPDFProducto}
          />
        </Col>
      </Row>

      {productosFiltrados.length > 0 && (
        <Row className="mt-3">
          <Col>
            <Paginacion
              registrosPorPagina={registrosPorPagina}
              totalRegistros={productosFiltrados.length}
              paginaActual={paginaActual}
              establecerPaginaActual={establecerPaginaActual}
              establecerRegistrosPorPagina={establecerRegistrosPorPagina}
            />
          </Col>
        </Row>
      )}

      {/* Modales */}

      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
        categorias={categorias}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoEdicion={manejoCambioArchivoEdicion}
        actualizarProducto={actualizarProducto}
        categorias={categorias}
      />

      <ModalEliminacionProducto
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        productoAEliminar={productoAEliminar}
        eliminarProducto={eliminarProducto}
      />
    </Container>
  );
};

export default Productos;
