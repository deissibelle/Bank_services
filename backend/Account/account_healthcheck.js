const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3002,
  path: '/health',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('Health check failed:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();