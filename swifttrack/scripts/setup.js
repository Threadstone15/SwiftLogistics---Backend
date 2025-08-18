#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Setting up SwiftTrack development environment...');

// Generate JWT secrets
function generateSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Create .env file from template
function createEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    return;
  }

  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example file not found');
    return;
  }

  let envContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // Replace placeholder secrets
  envContent = envContent.replace('your-super-secret-jwt-key-change-in-production', generateSecret());
  envContent = envContent.replace('your-super-secret-refresh-key-change-in-production', generateSecret());
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with generated secrets');
}

// Create logs directory
function createLogsDirectory() {
  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('✅ Created logs directory');
  } else {
    console.log('✅ Logs directory already exists');
  }
}

// Create data directories for Docker volumes
function createDataDirectories() {
  const dataDir = path.join(__dirname, '..', 'data');
  const dirs = ['postgres', 'redis', 'rabbitmq', 'minio', 'prometheus', 'grafana'];
  
  dirs.forEach(dir => {
    const dirPath = path.join(dataDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created data/${dir} directory`);
    }
  });
}

// Create infrastructure configuration files
function createInfraConfig() {
  const infraDir = path.join(__dirname, '..', 'infra');
  
  // Create PostgreSQL init script
  const postgresDir = path.join(infraDir, 'postgres');
  if (!fs.existsSync(postgresDir)) {
    fs.mkdirSync(postgresDir, { recursive: true });
  }
  
  const initSql = `-- SwiftTrack Database Initialization
-- This script runs when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE swifttrack'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'swifttrack');
`;
  
  fs.writeFileSync(path.join(postgresDir, 'init.sql'), initSql);
  console.log('✅ Created PostgreSQL initialization script');

  // Create RabbitMQ configuration
  const rabbitmqDir = path.join(infraDir, 'rabbitmq');
  if (!fs.existsSync(rabbitmqDir)) {
    fs.mkdirSync(rabbitmqDir, { recursive: true });
  }

  const rabbitmqConf = `# RabbitMQ Configuration
management.load_definitions = /etc/rabbitmq/definitions.json
`;

  const rabbitmqDefinitions = {
    "rabbit_version": "3.12.0",
    "rabbitmq_version": "3.12.0",
    "users": [],
    "vhosts": [{"name": "/"}],
    "permissions": [],
    "parameters": [],
    "policies": [],
    "queues": [],
    "exchanges": [],
    "bindings": []
  };

  fs.writeFileSync(path.join(rabbitmqDir, 'rabbitmq.conf'), rabbitmqConf);
  fs.writeFileSync(path.join(rabbitmqDir, 'definitions.json'), JSON.stringify(rabbitmqDefinitions, null, 2));
  console.log('✅ Created RabbitMQ configuration');

  // Create Prometheus configuration
  const prometheusDir = path.join(infraDir, 'prometheus');
  if (!fs.existsSync(prometheusDir)) {
    fs.mkdirSync(prometheusDir, { recursive: true });
  }

  const prometheusConfig = `global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'api-gateway'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/metrics'

  - job_name: 'order-service'
    static_configs:
      - targets: ['host.docker.internal:3001']
    metrics_path: '/metrics'

  - job_name: 'driver-service'
    static_configs:
      - targets: ['host.docker.internal:3002']
    metrics_path: '/metrics'

  - job_name: 'tracking-service'
    static_configs:
      - targets: ['host.docker.internal:3003']
    metrics_path: '/metrics'
`;

  fs.writeFileSync(path.join(prometheusDir, 'prometheus.yml'), prometheusConfig);
  console.log('✅ Created Prometheus configuration');

  // Create Grafana provisioning
  const grafanaDir = path.join(infraDir, 'grafana');
  const provisioningDir = path.join(grafanaDir, 'provisioning');
  const datasourcesDir = path.join(provisioningDir, 'datasources');
  const dashboardsDir = path.join(provisioningDir, 'dashboards');

  [provisioningDir, datasourcesDir, dashboardsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const datasourceConfig = `apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
`;

  fs.writeFileSync(path.join(datasourcesDir, 'prometheus.yml'), datasourceConfig);
  console.log('✅ Created Grafana configuration');
}

// Create mock services configuration
function createMockServices() {
  const mocksDir = path.join(__dirname, '..', 'infra', 'mocks');
  if (!fs.existsSync(mocksDir)) {
    fs.mkdirSync(mocksDir, { recursive: true });
  }

  // CMS Mock expectations
  const cmsExpectations = {
    "httpRequests": [
      {
        "httpRequest": {
          "method": "POST",
          "path": "/cms/soap/client"
        },
        "httpResponse": {
          "statusCode": 200,
          "headers": {
            "Content-Type": ["application/xml"]
          },
          "body": "<?xml version='1.0'?><soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body><ClientCreatedResponse><clientId>CMS123</clientId><status>success</status></ClientCreatedResponse></soap:Body></soap:Envelope>"
        }
      }
    ]
  };

  // ROS Mock expectations
  const rosExpectations = {
    "httpRequests": [
      {
        "httpRequest": {
          "method": "POST",
          "path": "/ros/api/optimize"
        },
        "httpResponse": {
          "statusCode": 200,
          "headers": {
            "Content-Type": ["application/json"]
          },
          "body": JSON.stringify({
            "routeId": "ROS123",
            "optimizedRoute": [],
            "totalDistance": 0,
            "totalDuration": 0
          })
        }
      }
    ]
  };

  fs.writeFileSync(path.join(mocksDir, 'cms-expectations.json'), JSON.stringify(cmsExpectations, null, 2));
  fs.writeFileSync(path.join(mocksDir, 'ros-expectations.json'), JSON.stringify(rosExpectations, null, 2));
  console.log('✅ Created mock service configurations');

  // Create WMS TCP mock server
  const wmsDir = path.join(mocksDir, 'wms');
  if (!fs.existsSync(wmsDir)) {
    fs.mkdirSync(wmsDir, { recursive: true });
  }

  const wmsDockerfile = `FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY server.js ./

EXPOSE 8082

CMD ["node", "server.js"]
`;

  const wmsPackageJson = {
    "name": "wms-mock-server",
    "version": "1.0.0",
    "main": "server.js",
    "dependencies": {
      "net": "*"
    }
  };

  const wmsServer = `const net = require('net');

const server = net.createServer((socket) => {
  console.log('WMS Client connected');

  socket.on('data', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received:', message);
      
      // Mock response
      const response = {
        id: message.id,
        type: 'response',
        status: 'success',
        timestamp: new Date().toISOString()
      };
      
      socket.write(JSON.stringify(response) + '\\n');
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  socket.on('end', () => {
    console.log('WMS Client disconnected');
  });
});

server.listen(8082, () => {
  console.log('WMS Mock Server listening on port 8082');
});
`;

  fs.writeFileSync(path.join(wmsDir, 'Dockerfile'), wmsDockerfile);
  fs.writeFileSync(path.join(wmsDir, 'package.json'), JSON.stringify(wmsPackageJson, null, 2));
  fs.writeFileSync(path.join(wmsDir, 'server.js'), wmsServer);
  console.log('✅ Created WMS mock server');
}

// Main setup function
async function setup() {
  try {
    createEnvFile();
    createLogsDirectory();
    createDataDirectories();
    createInfraConfig();
    createMockServices();

    console.log('\\n🎉 Setup completed successfully!');
    console.log('\\nNext steps:');
    console.log('1. Install dependencies: pnpm install');
    console.log('2. Start infrastructure: docker compose up -d');
    console.log('3. Run migrations: pnpm db:migrate');
    console.log('4. Seed data: pnpm db:seed');
    console.log('5. Start services: pnpm dev');
    console.log('6. Run smoke test: pnpm smoke-test');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setup();
