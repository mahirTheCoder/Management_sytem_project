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

// Test cases
const testCases = [
  {
    name: 'Valid Login (Correct Credentials)',
    data: {
      email: 'user@example.com',
      password: 'SecurePass123!',
    },
    expectedStatus: 200,
  },
  {
    name: 'Missing Email',
    data: {
      password: 'SecurePass123!',
    },
    expectedStatus: 400,
  },
  {
    name: 'Missing Password',
    data: {
      email: 'user@example.com',
    },
    expectedStatus: 400,
  },
  {
    name: 'Invalid Email Format (User Does Not Exist)',
    data: {
      email: 'nonexistent@example.com',
      password: 'SecurePass123!',
    },
    expectedStatus: 401,
  },
  {
    name: 'Wrong Password',
    data: {
      email: 'user@example.com',
      password: 'WrongPassword123!',
    },
    expectedStatus: 401,
  },
  {
    name: 'Empty Credentials',
    data: {
      email: '',
      password: '',
    },
    expectedStatus: 400,
  },
];

// Run tests
async function runTests() {
  console.log(`\n${colors.blue}=== Login API Test Suite ===${colors.reset}\n`);
  console.log(`Testing: ${API_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      console.log(`${colors.yellow}Testing: ${testCase.name}${colors.reset}`);
      console.log(`Request: ${JSON.stringify(testCase.data)}`);

      const response = await makeRequest(testCase.data);
      const body = JSON.parse(response.body);

      const statusMatch = response.statusCode === testCase.expectedStatus;
      const statusColor = statusMatch ? colors.green : colors.red;

      console.log(`${statusColor}Status: ${response.statusCode}${colors.reset}`);
      console.log(`Response: ${JSON.stringify(body, null, 2)}`);

      if (statusMatch) {
        console.log(`${colors.green}✓ PASSED${colors.reset}\n`);
        passed++;
      } else {
        console.log(
          `${colors.red}✗ FAILED - Expected status ${testCase.expectedStatus}, got ${response.statusCode}${colors.reset}\n`
        );
        failed++;
      }
    } catch (error) {
      console.log(`${colors.red}✗ ERROR: ${error.message}${colors.reset}\n`);
      failed++;
    }
  }

  console.log(`${colors.blue}=== Test Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${testCases.length}\n`);

  if (failed === 0) {
    console.log(
      `${colors.green}All tests passed! ✓${colors.reset}\n`
    );
    process.exit(0);
  } else {
    console.log(
      `${colors.red}Some tests failed! ✗${colors.reset}\n`
    );
    process.exit(1);
  }
}



// Start tests
console.log(`${colors.yellow}Checking server connection...${colors.reset}`);
checkServer();
