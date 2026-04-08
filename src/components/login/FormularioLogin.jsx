import React from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";

const FormularioLogin = ({usuario,contrasena,error,setUsuario,setContrasena,IniciarSesion,}) => {
    return (
    <Card
    style={{ minWidth: "32@px", maxWidth: "4@@px", width: "100%" }}
    className="p-4 shadow-1g"
    >
    <Card.Body>
        <h3 className="text-center mb-4">Iniciar Sesión </h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
        <Form.Group className="mb--3" controlId="usuario">
            <Form.Label>Usuario</Form.Label>
            <Form.Control
            type="text"
            placeholder="Ingresa tu usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            />
        </Form.Group>
        <Form.Group className="mb-3" controlId="contrasena">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
            type="password"
            placeholder="Ingresa tu contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            />
        </Form.Group>
        <Button variant="primary" className="w-100" onClick={IniciarSesion}>
            Iniciar Sesión
        </Button>
        </Form>
    </Card.Body>
    </Card>
);
};

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

export default FormularioLogin;
