import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Image,
    Badge,
    Spinner
} from 'react-bootstrap';
import { config } from '../../config';

const ProfilePage = () => {
    const { currentUser, loading, logout } = useAuth();
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const navigate = useNavigate();

    // Redirect to login page if user is not logged in
    useEffect(() => {
        if (!loading && !currentUser) {
            navigate('/login');
        }
    }, [currentUser, loading, navigate]);

    const handleLogout = () => {
        logout(() => {
            navigate('/login');
        });
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    // Do not continue rendering if user is not connected
    if (!currentUser) {
        return null;
    }

    // Get filename from URL or path
    const getFilenameFromPath = (path) => {
        if (!path) return null;
        // Split by / and get the last part
        const parts = path.split('/');
        return parts[parts.length - 1];
    };

    // Function to determine if a URL is an AWS S3 URL
    const isAwsUrl = (url) => {
        return url && (
            url.includes('amazonaws.com') ||
            url.includes('s3.') ||
            url.includes('mon-app-photos')
        );
    };

    // Function to get the appropriate image URL based on type and source
    const getImageUrl = (photo) => {
        // If no photo or no URL/name, return placeholder
        if (!photo || (!photo.url && !photo.name)) {
            return 'https://via.placeholder.com/400?text=Image+Not+Available';
        }

        // If it's already an AWS URL, use it directly
        if (photo.url && isAwsUrl(photo.url)) {
            return photo.url;
        }

        // For local storage
        if (photo.url && photo.url.includes('/public/uploads/')) {
            // Extract filename from local path
            const filename = getFilenameFromPath(photo.url);
            return `${config.baseUrl}/uploads/photos/${filename}`;
        } else if (photo.name) {
            // Default to local storage if it's just a filename
            return `${config.baseUrl}/uploads/photos/${photo.name}`;
        }

        // Fallback to the URL as-is
        return photo.url || 'https://via.placeholder.com/400?text=Image+Not+Available';
    };

    // Prepare photos array with correct URLs
    const photos = (currentUser?.photos || []).map(photo => {
        return {
            ...photo,
            imageUrl: getImageUrl(photo)
        };
    });

    // Handle avatar URL separately - use direct URL if it's an AWS URL
    const avatarUrl = currentUser.avatar && isAwsUrl(currentUser.avatar)
        ? currentUser.avatar
        : currentUser.avatar && currentUser.avatar.includes('/public/uploads/')
            ? `${config.baseUrl}/uploads/avatars/${getFilenameFromPath(currentUser.avatar)}`
            : currentUser.avatar || 'https://via.placeholder.com/150';

    return (
        <Container className="py-5">
            <Card className="shadow">
                <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="h3 mb-0">My Profile</h1>
                        <Button variant="danger" onClick={handleLogout}>Logout</Button>
                    </div>
                    <Row>
                        {/* Profile photo */}
                        <Col md={4} className="mb-4 mb-md-0">
                            <div className="text-center">
                                <Image
                                    src={avatarUrl}
                                    alt={`${currentUser.fullName}'s avatar`}
                                    roundedCircle
                                    className="border shadow-sm"
                                    style={{ width: '180px', height: '180px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        console.log("Error loading avatar:", currentUser.avatar);
                                        e.target.src = 'https://via.placeholder.com/180?text=No+Avatar';
                                    }}
                                />
                            </div>
                        </Col>
                        {/* User details */}
                        <Col md={8}>
                            <h4 className="mb-3">Personal Information</h4>
                            <Row>
                                <Col sm={6} className="mb-3">
                                    <div className="small text-muted">Full Name</div>
                                    <div className="fw-semibold">{currentUser.fullName}</div>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <div className="small text-muted">Email</div>
                                    <div className="fw-semibold">{currentUser.email}</div>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <div className="small text-muted">First Name</div>
                                    <div className="fw-semibold">{currentUser.firstName}</div>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <div className="small text-muted">Last Name</div>
                                    <div className="fw-semibold">{currentUser.lastName}</div>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <div className="small text-muted">Status</div>
                                    <div className="fw-semibold">
                                        <Badge bg={currentUser.active ? 'success' : 'danger'}>
                                            {currentUser.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <div className="small text-muted">Registration Date</div>
                                    <div className="fw-semibold">
                                        {new Date(currentUser.created_at).toLocaleDateString()}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {/* Photo gallery */}
                    <div className="mt-5">
                        <h4 className="mb-3">My Photos ({photos.length})</h4>
                        {photos.length > 0 ? (
                            <>
                                {/* Active photo */}
                                <div className="mb-3 border rounded overflow-hidden" style={{ height: '350px' }}>
                                    <div className="h-100 d-flex align-items-center justify-content-center bg-light">
                                        <Image
                                            src={photos[activePhotoIndex].imageUrl}
                                            alt={photos[activePhotoIndex].name}
                                            className="mh-100 mw-100"
                                            style={{ objectFit: 'contain' }}
                                            onError={(e) => {
                                                console.log("Error loading image:", photos[activePhotoIndex]);
                                                e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Available';
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Thumbnails */}
                                <Row className="g-2">
                                    {photos.map((photo, index) => (
                                        <Col key={index} xs={6} sm={4} md={3} lg={2}>
                                            <div
                                                className={`rounded overflow-hidden ${index === activePhotoIndex ? 'border border-primary border-2' : 'border'}`}
                                                onClick={() => setActivePhotoIndex(index)}
                                                style={{ height: '80px', cursor: 'pointer' }}
                                            >
                                                <Image
                                                    src={photo.imageUrl}
                                                    alt={photo.name}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/80?text=Error';
                                                    }}
                                                />
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        ) : (
                            <p className="text-muted">No photos available</p>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfilePage;