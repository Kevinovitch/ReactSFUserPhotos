export const config = {
    aws: {
        region: import.meta.env.VITE_AWS_REGION || 'your-aws-region',
        bucket: import.meta.env.VITE_AWS_BUCKET || 'your-aws-bucket',
    },
    apiUrl: import.meta.env.VITE_API_URL || '/api',
    baseUrl: import.meta.env.VITE_BASE_URL || 'https://reactsfuserphotos-production.up.railway.app',
};