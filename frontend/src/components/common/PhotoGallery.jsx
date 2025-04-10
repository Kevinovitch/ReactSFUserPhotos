import { useState } from 'react';
import { Row, Col, Image } from 'react-bootstrap';

const PhotoGallery = ({ photos }) => {
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    if (!photos || photos.length === 0) {
        return <p className="text-muted">No photos available</p>;
    }

    return (
        <div>
            {/* Active photo */}
            <div className="mb-3 border rounded overflow-hidden" style={{ height: '350px' }}>
                <div className="h-100 d-flex align-items-center justify-content-center bg-light">
                    <Image
                        src={photos[activePhotoIndex].url}
                        alt={photos[activePhotoIndex].name}
                        className="mh-100 mw-100"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
            </div>

            {/* Thumbnails */}
            <Row className="g-2">
                {photos.map((photo, index) => (
                    <Col key={photo.id} xs={6} sm={4} md={3} lg={2}>
                        <div
                            className={`rounded overflow-hidden ${index === activePhotoIndex ? 'border border-primary border-2' : 'border'}`}
                            onClick={() => setActivePhotoIndex(index)}
                            style={{ height: '80px', cursor: 'pointer' }}
                        >
                            <Image
                                src={photo.url}
                                alt={photo.name}
                                className="w-100 h-100"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default PhotoGallery;