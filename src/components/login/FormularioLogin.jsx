import React from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";

const FormularioLogin = ({
  usuario,
  contrasena,
  error,
  cargando,
  setUsuario,
  setContrasena,
  IniciarSesion,
}) => {
  return (
    <Card className="login-tarjeta">
      <Card.Body>
        <h2 className="text-center mb-1">Iniciar sesión</h2>
        <p className="text-center text-muted mb-4">
          Ingresa tus credenciales para continuar
        </p>

        {error && (
          <Alert variant="danger" className="alert-discosa py-2">
            {error}
          </Alert>
        )}

        <Form onSubmit={IniciarSesion}>
          <Form.Group className="mb-3" controlId="usuario">
            <Form.Label>Correo electrónico</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-envelope" />
              </span>
              <Form.Control
                type="email"
                placeholder="tu@correo.com"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4" controlId="contrasena">
            <Form.Label>Contraseña</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock" />
              </span>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100 btn-discosa"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Ingresando...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2" />
                Iniciar sesión
              </>
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioLogin;
