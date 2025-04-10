import { Component } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Container className="py-5 text-center">
                    <Alert variant="danger">
                        <Alert.Heading>Something went wrong</Alert.Heading>
                        <p>
                            An error occurred. Please refresh the page or try again later.
                        </p>
                        <hr />
                        <div className="d-flex justify-content-center">
                            <Button
                                variant="outline-danger"
                                onClick={() => window.location.reload()}
                            >
                                Refresh Page
                            </Button>
                        </div>
                    </Alert>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;