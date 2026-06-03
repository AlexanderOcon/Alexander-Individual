import React, { useEffect, useState, useRef } from "react";
import { Row, Col, Card, Spinner, Form, Button } from "react-bootstrap";
import { Chart as ChartJS, registerables } from "chart.js";
import { supabase } from "../database/supabaseconfig";
import * as XLSX from "xlsx";
import LayoutPagina from "../components/layout/LayoutPagina";

ChartJS.register(...registerables);

const COLORES = [
  "#1068db",
  "#2697cc",
  "#1e3d87",
  "#5ea5f1",
  "#198754",
  "#e27d01",
];

const Inicio = () => {
  const [cargando, setCargando] = useState(true);
  const [fechaDesde, setFechaDesde] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" })
  );
  const [fechaHasta, setFechaHasta] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" })
  );
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    ventasEfectivo: 0,
    ventasTarjeta: 0,
    productosVendidos: 0,
    montoProductos: 0,
    cantidadVentas: 0,
    ventasPorHora: [],
    ventasPorCategoria: [],
  });

  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const lineChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  useEffect(() => {
    cargarDatos(fechaDesde, fechaHasta);
  }, [fechaDesde, fechaHasta]);

  // Crear/actualizar gráficos cuando cambian los datos
  useEffect(() => {
    if (cargando) return;

    // --- Gráfico de línea: Ventas por Hora ---
    if (lineChartRef.current) {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }

      const labels = estadisticas.ventasPorHora.map((v) => v.hora);
      const data = estadisticas.ventasPorHora.map((v) => v.total);

      lineChartInstance.current = new ChartJS(lineChartRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Ventas (C$)",
              data,
              borderColor: "#1068db",
              backgroundColor: "rgba(16,104,219,0.1)",
              borderWidth: 3,
              pointRadius: 5,
              pointBackgroundColor: "#1068db",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `C$ ${ctx.parsed.y}`,
              },
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (v) => `C$${v}`,
              },
            },
          },
        },
      });
    }

    // --- Gráfico de pie: Ventas por Categoría ---
    if (pieChartRef.current) {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      const categorias =
        estadisticas.ventasPorCategoria.length > 0
          ? estadisticas.ventasPorCategoria
          : [{ name: "Sin datos", value: 1 }];

      const labels = categorias.map((c) => c.name);
      const data = categorias.map((c) => c.value);
      const backgroundColors = categorias.map(
        (_, i) => COLORES[i % COLORES.length]
      );

      pieChartInstance.current = new ChartJS(pieChartRef.current, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: backgroundColors,
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { boxWidth: 14, padding: 10 },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  ` ${ctx.label}: C$ ${ctx.parsed.toFixed(2)}`,
              },
            },
          },
        },
      });
    }

    // Limpiar al desmontar
    return () => {
      lineChartInstance.current?.destroy();
      pieChartInstance.current?.destroy();
    };
  }, [estadisticas, cargando]);

  const cargarDatos = async (desde, hasta) => {
    try {
      setCargando(true);
      const inicioRango = `${desde} 00:00:00`;
      const finRango = `${hasta} 23:59:59`;

      const { data: ventas, error } = await supabase
        .from("ventas")
        .select("id_venta, total, fecha_venta, metodo_pago")
        .gte("fecha_venta", inicioRango)
        .lte("fecha_venta", finRango);

      if (error) throw error;

      const idsVentas = ventas?.map((v) => v.id_venta) || [];

      let productosVendidos = 0;
      let montoProductos = 0;
      let ventasPorCategoria = [];

      if (idsVentas.length > 0) {
        const { data: detalles } = await supabase
          .from("detalles_ventas")
          .select(
            `cantidad, subtotal, productos (nombre_producto)`
          )
          .in("id_venta", idsVentas);

        detalles?.forEach((d) => {
          productosVendidos += d.cantidad || 0;
          montoProductos += d.subtotal || 0;

          const categoria = "General";
          const existente = ventasPorCategoria.find((c) => c.name === categoria);

          if (existente) {
            existente.value += d.subtotal || 0;
          } else {
            ventasPorCategoria.push({ name: categoria, value: d.subtotal || 0 });
          }
        });

        ventasPorCategoria.sort((a, b) => b.value - a.value);
      }

      const totalVentas =
        ventas?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;
      const ventasEfectivo =
        ventas
          ?.filter((v) => v.metodo_pago === "efectivo")
          .reduce((sum, v) => sum + (v.total || 0), 0) || 0;
      const ventasTarjeta =
        ventas
          ?.filter((v) => v.metodo_pago === "tarjeta")
          .reduce((sum, v) => sum + (v.total || 0), 0) || 0;

      const horaMap = Array(24).fill(0);
      ventas?.forEach((venta) => {
        if (!venta.fecha_venta) return;
        const hora = new Date(venta.fecha_venta).getHours();
        if (hora >= 0 && hora < 24) horaMap[hora] += venta.total || 0;
      });

      const ventasPorHora = [];
      let acumulado = 0;
      for (let h = 8; h <= 22; h++) {
        acumulado += horaMap[h];
        ventasPorHora.push({
          hora: `${h.toString().padStart(2, "0")}:00`,
          total: Math.round(acumulado),
        });
      }

      setEstadisticas({
        totalVentas,
        ventasEfectivo,
        ventasTarjeta,
        productosVendidos,
        montoProductos,
        cantidadVentas: ventas?.length || 0,
        ventasPorHora,
        ventasPorCategoria,
      });
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setCargando(false);
    }
  };

  const descargarExcel = async () => {
    try {
      setCargando(true);
      const inicioRango = `${fechaDesde} 00:00:00`;
      const finRango = `${fechaHasta} 23:59:59`;

      const { data: ventas, error: errorVentas } = await supabase
        .from("ventas")
        .select(`id_venta, fecha_venta, total, metodo_pago, id_empleado, id_cliente`)
        .gte("fecha_venta", inicioRango)
        .lte("fecha_venta", finRango)
        .order("fecha_venta", { ascending: false });

      if (errorVentas) throw errorVentas;
      const idsVentas = ventas?.map((v) => v.id_venta) || [];
      let detallesVenta = [];

      if (idsVentas.length > 0) {
        const { data: detalles, error: errorDetalles } = await supabase
          .from("detalles_ventas")
          .select(
            `id_detalle, id_venta, cantidad, precio_unitario, subtotal, id_producto,
            productos (nombre_producto)`
          )
          .in("id_venta", idsVentas)
          .order("id_venta");

        if (errorDetalles) console.error("Error en detalles:", errorDetalles);
        else detallesVenta = detalles || [];
      }

      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          ventas?.length > 0 ? ventas : [{ Mensaje: "No hay ventas en este rango" }]
        ),
        "Ventas"
      );

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          detallesVenta.length > 0
            ? detallesVenta
            : [{ Mensaje: "No hay detalles de ventas" }]
        ),
        "Detalles_Ventas"
      );

      XLSX.writeFile(wb, `Reporte_Ventas_${fechaDesde}_a_${fechaHasta}.xlsx`);
    } catch (err) {
      console.error("Error generando Excel:", err);
      alert("Error al generar el Excel. Revisa la consola.");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="pagina-discosa text-center">
        <Spinner animation="border" className="spinner-discosa" size="lg" />
        <p className="mt-3 text-muted">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <LayoutPagina
      titulo="Inicio"
      subtitulo="Estadísticas del negocio"
      icono="bi-speedometer2"
      herramientas={
        <Row className="g-3 align-items-end">
          <Col xs={6} md={3}>
            <Form.Group>
              <Form.Label>Desde</Form.Label>
              <Form.Control
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={6} md={3}>
            <Form.Group>
              <Form.Label>Hasta</Form.Label>
              <Form.Control
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button variant="success" onClick={descargarExcel}>
              <i className="bi bi-file-earmark-excel me-2" />
              Descargar Excel
            </Button>
          </Col>
        </Row>
      }
    >
      <Row className="g-4 mb-4">
        <Col xs={12} md={6} lg={3}>
          <Card
            className="h-100 text-white kpi-card"
            style={{ background: "var(--discosa-gradient-vertical)" }}
          >
            <Card.Body>
              <h5>
                <i className="bi bi-cash-stack me-2" />
                Ventas totales
              </h5>
              <h2>C$ {estadisticas.totalVentas.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3}>
          <Card
            className="h-100 text-white kpi-card"
            style={{ background: "linear-gradient(135deg, #198754, #34ce57)" }}
          >
            <Card.Body>
              <h5>
                <i className="bi bi-wallet2 me-2" />
                Efectivo
              </h5>
              <h2>C$ {estadisticas.ventasEfectivo.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3}>
          <Card
            className="h-100 text-white kpi-card"
            style={{ background: "linear-gradient(135deg, #1068db, #5ea5f1)" }}
          >
            <Card.Body>
              <h5>
                <i className="bi bi-credit-card me-2" />
                Tarjeta
              </h5>
              <h2>C$ {estadisticas.ventasTarjeta.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3}>
          <Card
            className="h-100 text-white kpi-card"
            style={{ background: "linear-gradient(135deg, #e27d01, #ffa500)" }}
          >
            <Card.Body>
              <h5>
                <i className="bi bi-bag-check me-2" />
                Productos vendidos
              </h5>
              <h2>{estadisticas.productosVendidos}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card className="chart-card">
            <Card.Body>
              <h5 className="mb-3">Ventas por hora</h5>
              <div style={{ position: "relative", height: "300px" }}>
                <canvas ref={lineChartRef} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="chart-card">
            <Card.Body>
              <h5 className="mb-3">Ventas por categoría</h5>
              <div style={{ position: "relative", height: "300px" }}>
                <canvas ref={pieChartRef} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </LayoutPagina>
  );
};

export default Inicio;