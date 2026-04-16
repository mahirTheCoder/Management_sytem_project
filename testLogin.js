/**
 * Login API Test Script
 * Run: node testLogin.js
 * 
 * This script tests various login scenarios
 */

const http = require('http');

// Config
const API_HOST = 'localhost';
const API_PORT = 8000;
const API_URL = `http://${API_HOST}:${API_PORT}/auth/login`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Helper function to make HTTP request
function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data)),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: responseBody,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}


// Start tests
console.log(`${colors.yellow}Checking server connection...${colors.reset}`);
checkServer();
