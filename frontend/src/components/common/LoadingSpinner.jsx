import { Spinner } from 'react-bootstrap';

const LoadingSpinner = () => {
    return (
        <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );
};

export default LoadingSpinner;