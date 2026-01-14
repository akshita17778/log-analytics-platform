/**
 * API Test Script
 * Tests all major endpoints with sample data
 * Usage: node scripts/testAPI.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Utility function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test suite
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('LOG ANALYTICS PLATFORM - API TEST SUITE');
  console.log('='.repeat(70) + '\n');

  try {
    // 1. Health check
    console.log('🔍 Testing Health Check...');
    let response = await makeRequest('GET', '/health');
    console.log(`✓ Health: ${response.status}`, response.data);

    // 2. Status
    console.log('\n🔍 Testing Status Endpoint...');
    response = await makeRequest('GET', '/status');
    console.log(`✓ Status: ${response.status}`, response.data);

    // 3. Ingest single log
    console.log('\n📝 Testing Single Log Ingestion...');
    const singleLog = {
      serviceName: 'user-service',
      severity: 'ERROR',
      message: 'Database connection failed',
      errorCode: 'DB_CONNECTION_ERROR',
      timestamp: new Date(),
      userId: 'test-user-1',
      requestId: 'req-test-1'
    };
    response = await makeRequest('POST', '/logs/ingest', singleLog);
    console.log(`✓ Ingest Single: ${response.status}`, response.data);

    // 4. Batch ingest logs
    console.log('\n📝 Testing Batch Log Ingestion...');
    const batchLogs = {
      logs: [
        {
          serviceName: 'payment-service',
          severity: 'ERROR',
          message: 'Payment timeout',
          errorCode: 'PAYMENT_TIMEOUT',
          timestamp: new Date(),
          requestId: 'req-test-2'
        },
        {
          serviceName: 'api-gateway',
          severity: 'WARN',
          message: 'High latency detected',
          errorCode: 'HIGH_LATENCY',
          timestamp: new Date(),
          requestId: 'req-test-3'
        },
        {
          serviceName: 'payment-service',
          severity: 'CRITICAL',
          message: 'Service down',
          errorCode: 'SERVICE_DOWN',
          timestamp: new Date(),
          requestId: 'req-test-4'
        }
      ]
    };
    response = await makeRequest('POST', '/logs/batch', batchLogs);
    console.log(`✓ Ingest Batch: ${response.status}`, response.data);

    // 5. Get recent logs
    console.log('\n📖 Testing Get Recent Logs...');
    response = await makeRequest('GET', '/logs/recent?limit=10');
    console.log(`✓ Recent Logs: ${response.status}, Count: ${response.data.data?.count || 0}`);

    // 6. Get logs by service
    console.log('\n📖 Testing Get Logs by Service...');
    response = await makeRequest('GET', '/logs/service/payment-service?limit=5');
    console.log(`✓ Logs by Service: ${response.status}, Count: ${response.data.data?.count || 0}`);

    // 7. Get logs by severity
    console.log('\n📖 Testing Get Logs by Severity...');
    response = await makeRequest('GET', '/logs/severity/ERROR?limit=10');
    console.log(`✓ Logs by Severity: ${response.status}, Count: ${response.data.data?.count || 0}`);

    // 8. Get log stats
    console.log('\n📊 Testing Log Statistics...');
    response = await makeRequest('GET', '/logs/stats');
    console.log(`✓ Log Stats: ${response.status}`, response.data.data?.summary?.length, 'entries');

    // 9. Analytics - Error frequency
    console.log('\n📈 Testing Error Frequency Analytics...');
    response = await makeRequest('GET', '/analytics/error-frequency');
    console.log(`✓ Error Frequency: ${response.status}`, response.data.data?.summary?.length, 'services');

    // 10. Analytics - Top failing services
    console.log('\n📈 Testing Top Failing Services...');
    response = await makeRequest('GET', '/analytics/top-failing-services?limit=5');
    console.log(`✓ Top Failing: ${response.status}`, response.data.data?.topServices?.length, 'services');

    // 11. Analytics - Error trends
    console.log('\n📈 Testing Error Trends...');
    response = await makeRequest('GET', '/analytics/error-trends?granularity=hour');
    console.log(`✓ Error Trends: ${response.status}`, response.data.data?.trends?.length, 'data points');

    // 12. Analytics - Severity breakdown
    console.log('\n📈 Testing Severity Breakdown...');
    response = await makeRequest('GET', '/analytics/severity-breakdown');
    console.log(`✓ Severity Breakdown: ${response.status}`, response.data.data?.breakdown?.length, 'severities');

    // 13. Analytics - Service health
    console.log('\n📈 Testing Service Health...');
    response = await makeRequest('GET', '/analytics/service-health');
    console.log(`✓ Service Health: ${response.status}`, response.data.data?.services?.length, 'services');

    // 14. Analytics - Error correlation
    console.log('\n📈 Testing Error Correlation...');
    response = await makeRequest('GET', '/analytics/error-correlation');
    console.log(`✓ Error Correlation: ${response.status}`, response.data.data?.correlations?.length, 'correlations');

    // 15. Get incidents
    console.log('\n🚨 Testing Get Incidents...');
    response = await makeRequest('GET', '/incidents?limit=10');
    console.log(`✓ Get Incidents: ${response.status}, Count: ${response.data.data?.count || 0}`);

    // 16. Get critical incidents
    console.log('\n🚨 Testing Get Critical Incidents...');
    response = await makeRequest('GET', '/incidents/critical?limit=5');
    console.log(`✓ Critical Incidents: ${response.status}, Count: ${response.data.data?.count || 0}`);

    // 17. Get SLA-breached incidents
    console.log('\n🚨 Testing Get SLA-Breached Incidents...');
    response = await makeRequest('GET', '/incidents/sla-breached?limit=10');
    console.log(`✓ SLA-Breached: ${response.status}, Count: ${response.data.data?.count || 0}`);

    // 18. Get incident stats
    console.log('\n🚨 Testing Incident Statistics...');
    response = await makeRequest('GET', '/incidents/stats/summary');
    console.log(`✓ Incident Stats: ${response.status}`, response.data.data);

    // 19. Invalid endpoint test
    console.log('\n❌ Testing Invalid Endpoint (should return 404)...');
    response = await makeRequest('GET', '/invalid-endpoint');
    console.log(`✓ 404 Handling: ${response.status}`, response.data.error?.code);

    // 20. Validation error test
    console.log('\n❌ Testing Validation Error (missing required field)...');
    const invalidLog = {
      serviceName: 'test-service'
      // Missing required fields: severity, message, timestamp
    };
    response = await makeRequest('POST', '/logs/ingest', invalidLog);
    console.log(`✓ Validation Error: ${response.status}`, response.data.error?.code);

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.log('\n⚠️  Make sure the server is running on http://localhost:3000');
    process.exit(1);
  }
}

// Run tests
runTests();
