import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    Form,
    Button,
    Container,
    Card,
    Alert
} from 'react-bootstrap';

const RegisterForm = () => {
    const { register, registerWithAWS, error } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [photoError, setPhotoError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [storageType, setStorageType] = useState('local');
    const navigate = useNavigate();

    // Yup validation schema
    const validationSchema = Yup.object({
        firstName: Yup.string()
            .min(2, 'First name must be at least 2 characters')
            .max(25, 'First name cannot exceed 25 characters')
            .required('First name is required'),
        lastName: Yup.string()
            .min(2, 'Last name must be at least 2 characters')
            .max(25, 'Last name cannot exceed 25 characters')
            .required('Last name is required'),
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .max(50, 'Password cannot exceed 50 characters')
            .matches(/[0-9]/, 'Password must contain at least one number')
            .required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            avatar: null,
        },
        validationSchema,
        onSubmit: async (values) => {
            // Check number of photos
            if (photos.length < 4) {
                setPhotoError('You must upload at least 4 photos');
                return;
            }

            setIsSubmitting(true);
            setPhotoError('');

            try {
                // Prepare data with files
                const userData = {
                    ...values,
                    photos: photos,
                };

                // Use appropriate registration method based on storage choice
                if (storageType === 'aws') {
                    await registerWithAWS(userData, () => {
                        setSuccessMessage('Registration successful! Redirecting to login page...');
                        setTimeout(() => navigate('/login', {
                            state: { message: 'Registration successful with AWS storage! Please log in.' }
                        }), 1500);
                    });
                } else {
                    await register(userData, () => {
                        setSuccessMessage('Registration successful! Redirecting to login page...');
                        setTimeout(() => navigate('/login', {
                            state: { message: 'Registration successful! Please log in.' }
                        }), 1500);
                    });
                }
            } catch (err) {
                console.error('Error during registration:', err);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // Handle avatar file change
    const handleAvatarChange = (event) => {
        const file = event.currentTarget.files[0];
        formik.setFieldValue('avatar', file);
    };

    // Handle photos files change
    const handlePhotosChange = (event) => {
        const files = Array.from(event.currentTarget.files);
        setPhotos(files);

        if (files.length < 4) {
            setPhotoError('You must upload at least 4 photos');
        } else {
            setPhotoError('');
        }
    };

    return (
        <Container className="py-5">
            <Card className="mx-auto shadow" style={{ maxWidth: '500px' }}>
                <Card.Body className="p-4">
                    <h2 className="text-center mb-4">Register</h2>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="firstName"
                                name="firstName"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.firstName}
                                isInvalid={formik.touched.firstName && formik.errors.firstName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.firstName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="lastName"
                                name="lastName"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.lastName}
                                isInvalid={formik.touched.lastName && formik.errors.lastName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.lastName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                id="email"
                                name="email"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                isInvalid={formik.touched.email && formik.errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                id="password"
                                name="password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                isInvalid={formik.touched.password && formik.errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Avatar (optional)</Form.Label>
                            <Form.Control
                                type="file"
                                id="avatar"
                                name="avatar"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Photos (minimum 4)</Form.Label>
                            <Form.Control
                                type="file"
                                id="photos"
                                name="photos"
                                accept="image/*"
                                multiple
                                onChange={handlePhotosChange}
                                isInvalid={!!photoError}
                            />
                            {photoError ? (
                                <Form.Control.Feedback type="invalid">
                                    {photoError}
                                </Form.Control.Feedback>
                            ) : (
                                <Form.Text className="text-muted">
                                    {photos.length} photo(s) selected
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Storage Type</Form.Label>
                            <div>
                                <Form.Check
                                    inline
                                    type="radio"
                                    id="localStorage"
                                    label="Local Storage"
                                    name="storageType"
                                    value="local"
                                    checked={storageType === 'local'}
                                    onChange={e => setStorageType(e.target.value)}
                                />
                                <Form.Check
                                    inline
                                    type="radio"
                                    id="awsStorage"
                                    label="AWS Cloud Storage"
                                    name="storageType"
                                    value="aws"
                                    checked={storageType === 'aws'}
                                    onChange={e => setStorageType(e.target.value)}
                                />
                            </div>
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registering...' : 'Register'}
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        Already registered? <Link to="/login">Sign in</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RegisterForm;