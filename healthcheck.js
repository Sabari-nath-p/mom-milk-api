const http = require('http');

// Health check script for NestJS application
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    timeout: 2000
};

const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
        console.log('Application is healthy');
        process.exit(0);
    } else {
        console.log('Application is unhealthy');
        process.exit(1);
    }
});

req.on('error', (err) => {
    console.log('Application is unhealthy:', err.message);
    process.exit(1);
});

req.on('timeout', () => {
    console.log('Application health check timed out');
    process.exit(1);
});

req.end();
