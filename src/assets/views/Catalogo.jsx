import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Catalogo = () => (
  <Container className="mt-3">
    <Row>
      <Col>
        <h2><i className="bi-images me-2"></i>Catálogo</h2>
        <p>Catálogo público de productos.</p>
      </Col>
    </Row>
  </Container>
);

export default Catalogo;
