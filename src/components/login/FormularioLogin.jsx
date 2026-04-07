import React from "react";
import {Form, Button, Card, Alert}from "react-bootstrap";

const FormularioLogin = ({usuario,contrasena, error, setUsuario, setContrasena, IniciarSesion}) => {

    return (
        <Card style={{ minWidth:"32@px", maxWidth:"4@@px", width:"100%" }} className="p-4 shadow-1g">
            <Card.Body>
                <h3 className="text-center mb-4">Iniciar Sesióne </h3>

    {error && <Alert variant="danger">{error}</Alert>}

    <Form>
        <Form.Group className="mb--3" controlId="usuario">
            <Form.Label>Usuario</Form.Label>
            <Form.Control
            type="text"
            placeholder="Ingresa tu usuario"
            value={usuario}
            onChange={(e)=> setUsuario(e.target.value)}
            required
        />
        </Form.Group>

        <Form.Group className="mb-3" controlId="contrasena">
            <Form.Label>Contraseñac</Form.Label>
            <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(e)=> setContrasena(e.target.value)}
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

<div style={estiloContenedor}>
    <FormularioLogin
        usuario={usuario}
        contrasena={contrasena}
        error={error}
        setUsuario={setUsuario}
        setContrasena={setContrasena}
        IniciarSesion={IniciarSesion}
    />
</div>

export default FormularioLogin; 