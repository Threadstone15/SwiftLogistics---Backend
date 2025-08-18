#!/usr/bin/env node

const axios = require('axios');
const { WebSocket } = require('ws');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const WS_BASE_URL = process.env.WS_BASE_URL || 'ws://localhost:3000';

class SmokeTest {
  constructor() {
    this.testResults = [];
    this.accessToken = null;
    this.driverToken = null;
    this.testOrderId = null;
  }

  async run() {
    console.log('🧪 Starting SwiftTrack smoke tests...');
    console.log(`📍 API Base URL: ${API_BASE_URL}`);
    console.log(`🔌 WebSocket URL: ${WS_BASE_URL}`);

    try {
      await this.testHealthCheck();
      await this.testClientRegistrationAndLogin();
      await this.testDriverLogin();
      await this.testOrderCreation();
      await this.testOrderStatusUpdates();
      await this.testDriverOperations();
      await this.testWebSocketConnection();
      await this.testOrderDelivery();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Smoke test failed:', error.message);
      process.exit(1);
    }
  }

  async testHealthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      this.addResult('Health Check', response.status === 200, response.data);
    } catch (error) {
      this.addResult('Health Check', false, error.message);
      throw error;
    }
  }

  async testClientRegistrationAndLogin() {
    try {
      // Register client
      const registerData = {
        email: `test-client-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        userType: 'client'
      };

      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
      this.addResult('Client Registration', registerResponse.status === 201);

      // Login
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: registerData.email,
        password: registerData.password
      });

      this.accessToken = loginResponse.data.accessToken;
      this.addResult('Client Login', loginResponse.status === 200 && !!this.accessToken);
    } catch (error) {
      this.addResult('Client Auth', false, error.message);
      throw error;
    }
  }

  async testDriverLogin() {
    try {
      // Use seeded driver credentials
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'driver1@swifttrack.com',
        password: 'Driver123!'
      });

      this.driverToken = loginResponse.data.accessToken;
      this.addResult('Driver Login', loginResponse.status === 200 && !!this.driverToken);
    } catch (error) {
      this.addResult('Driver Login', false, error.message);
      // Don't throw here, continue with client tests
    }
  }

  async testOrderCreation() {
    try {
      const orderData = {
        orderSize: 'medium',
        orderWeight: 'medium',
        orderType: 'standard_delivery',
        priority: false,
        amount: 150.00,
        address: '123 Test Street, Colombo 03',
        locationOrigin: {
          lng: 79.8612,
          lat: 6.9271,
          address: 'Warehouse, Colombo'
        },
        locationDestination: {
          lng: 79.8541,
          lat: 6.9344,
          address: '123 Test Street, Colombo 03'
        },
        specialInstructions: 'Handle with care - smoke test order'
      };

      const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      this.testOrderId = response.data.orderId;
      this.addResult('Order Creation', response.status === 201 && !!this.testOrderId);
    } catch (error) {
      this.addResult('Order Creation', false, error.message);
      throw error;
    }
  }

  async testOrderStatusUpdates() {
    if (!this.testOrderId) {
      this.addResult('Order Status Updates', false, 'No test order ID');
      return;
    }

    try {
      // Simulate order progression through the system
      const statusProgression = [
        'at_warehouse',
        'picked',
        'in_transit'
      ];

      for (const status of statusProgression) {
        const response = await axios.patch(
          `${API_BASE_URL}/orders/${this.testOrderId}/status`,
          { status },
          { headers: { Authorization: `Bearer ${this.accessToken}` } }
        );

        if (response.status !== 200) {
          throw new Error(`Failed to update status to ${status}`);
        }

        // Small delay between status updates
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.addResult('Order Status Updates', true);
    } catch (error) {
      this.addResult('Order Status Updates', false, error.message);
    }
  }

  async testDriverOperations() {
    if (!this.driverToken) {
      this.addResult('Driver Operations', false, 'No driver token');
      return;
    }

    try {
      // Test driver manifest
      const manifestResponse = await axios.get(`${API_BASE_URL}/drivers/me/manifest`, {
        headers: { Authorization: `Bearer ${this.driverToken}` }
      });

      // Test driver route
      const routeResponse = await axios.get(`${API_BASE_URL}/drivers/me/route`, {
        headers: { Authorization: `Bearer ${this.driverToken}` }
      });

      // Test location update
      const locationResponse = await axios.post(
        `${API_BASE_URL}/drivers/me/location`,
        {
          lng: 79.8612,
          lat: 6.9271,
          speed: 45,
          heading: 180
        },
        { headers: { Authorization: `Bearer ${this.driverToken}` } }
      );

      const allSuccessful = [manifestResponse, routeResponse, locationResponse]
        .every(res => res.status >= 200 && res.status < 300);

      this.addResult('Driver Operations', allSuccessful);
    } catch (error) {
      this.addResult('Driver Operations', false, error.message);
    }
  }

  async testWebSocketConnection() {
    if (!this.testOrderId) {
      this.addResult('WebSocket Connection', false, 'No test order ID');
      return;
    }

    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(`${WS_BASE_URL}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        });

        let connected = false;
        const timeout = setTimeout(() => {
          if (!connected) {
            ws.close();
            this.addResult('WebSocket Connection', false, 'Connection timeout');
            resolve();
          }
        }, 5000);

        ws.on('open', () => {
          connected = true;
          clearTimeout(timeout);
          
          // Join order room
          ws.send(JSON.stringify({
            event: 'join_room',
            data: { room: `orders/${this.testOrderId}` }
          }));

          setTimeout(() => {
            ws.close();
            this.addResult('WebSocket Connection', true);
            resolve();
          }, 1000);
        });

        ws.on('error', (error) => {
          clearTimeout(timeout);
          this.addResult('WebSocket Connection', false, error.message);
          resolve();
        });
      } catch (error) {
        this.addResult('WebSocket Connection', false, error.message);
        resolve();
      }
    });
  }

  async testOrderDelivery() {
    if (!this.testOrderId || !this.driverToken) {
      this.addResult('Order Delivery', false, 'Missing requirements');
      return;
    }

    try {
      // Mark order as delivered
      const deliveryResponse = await axios.patch(
        `${API_BASE_URL}/orders/${this.testOrderId}/status`,
        { status: 'delivered' },
        { headers: { Authorization: `Bearer ${this.driverToken}` } }
      );

      // Confirm delivery as client
      const confirmResponse = await axios.post(
        `${API_BASE_URL}/orders/${this.testOrderId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      );

      const successful = deliveryResponse.status === 200 && confirmResponse.status === 200;
      this.addResult('Order Delivery', successful);
    } catch (error) {
      this.addResult('Order Delivery', false, error.message);
    }
  }

  addResult(testName, passed, details = null) {
    this.testResults.push({
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });

    const status = passed ? '✅' : '❌';
    const detailsStr = details ? ` (${details})` : '';
    console.log(`${status} ${testName}${detailsStr}`);
  }

  printResults() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log('\\n📊 Smoke Test Results:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`   - ${r.test}: ${r.details || 'Unknown error'}`));
      
      process.exit(1);
    } else {
      console.log('\\n🎉 All smoke tests passed! System is ready for use.');
    }
  }
}

// Run smoke tests
if (require.main === module) {
  const smokeTest = new SmokeTest();
  smokeTest.run().catch(error => {
    console.error('Smoke test runner failed:', error);
    process.exit(1);
  });
}

module.exports = SmokeTest;
