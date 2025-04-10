import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const HomePage = () => {
    const { currentUser } = useAuth();

    return (
        <div className="bg-light min-vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={8} className="text-center">
                        <h1 className="display-4 fw-bold mb-3">Share your best photos</h1>
                        <p className="lead mb-5">
                            A simple and elegant platform to store, organize, and share your favorite photos.
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                            {currentUser ? (
                                <Button
                                    as={Link}
                                    to="/profile"
                                    variant="primary"
                                    size="lg"
                                >
                                    View My Profile
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        as={Link}
                                        to="/register"
                                        variant="primary"
                                        size="lg"
                                    >
                                        Register
                                    </Button>
                                    <Button
                                        as={Link}
                                        to="/login"
                                        variant="outline-primary"
                                        size="lg"
                                    >
                                        Sign In
                                    </Button>
                                </>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default HomePage;