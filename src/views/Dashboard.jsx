import { Card } from "react-bootstrap";
import LayoutPagina from "../components/layout/LayoutPagina";

const Dashboard = () => {
  return (
    <LayoutPagina
      titulo="Dashboard"
      subtitulo="Estadísticas avanzadas en Power BI"
      icono="bi-graph-up"
    >
      <Card className="dashboard-embed" style={{ height: "min(75vh, 700px)" }}>
        <iframe
          title="Estadísticas"
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: "600px" }}
          src="https://app.powerbi.com/view?r=eyJrIjoiOGNmNDdmMDEtMzU0MC00NGZkLWIzNTctNTU4MTJhMjJkMThiIiwidCI6ImU0NzY0NmZlLWRhMjctNDUxOC04NDM2LTVmOGIxNThiYTEyNyIsImMiOjR9"
          allowFullScreen
        />
      </Card>
    </LayoutPagina>
  );
};

export default Dashboard;
