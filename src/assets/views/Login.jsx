import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const Login = () => (
  <Container className="mt-3">
    <Row>
      <Col>
        <h2><i className="bi-person-fill-lock me-2"></i>Login</h2>
        <p>Página de inicio de sesión.</p>
      </Col>
    </Row>
  </Container>
);

export default Login;
