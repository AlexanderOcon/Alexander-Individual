import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const Productos = () => (
  <Container className="mt-3">
    <Row>
      <Col>
        <h2><i className="bi-bag-heart-fill me-2"></i>Productos</h2>
        <p>Gestión de productos.</p>
      </Col>
    </Row>
  </Container>
);

export default Productos;
