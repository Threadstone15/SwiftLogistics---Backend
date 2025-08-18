const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.text({ type: 'text/xml' }));
app.use(express.json());

// Mock CMS SOAP service endpoints
app.post('/cms/services/OrderService', (req, res) => {
  console.log('CMS SOAP Request received:', req.body);
  
  // Parse basic SOAP request (simplified)
  const isCreateOrder = req.body.includes('createOrder');
  const isUpdateOrder = req.body.includes('updateOrder');
  const isGetOrder = req.body.includes('getOrder');
  
  if (isCreateOrder) {
    const soapResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <createOrderResponse xmlns="http://cms.swifttrack.com/services">
            <orderId>CMS-${Date.now()}</orderId>
            <status>CREATED</status>
            <message>Order created successfully in CMS</message>
          </createOrderResponse>
        </soap:Body>
      </soap:Envelope>
    `;
    res.set('Content-Type', 'text/xml');
    res.send(soapResponse);
  } else if (isUpdateOrder) {
    const soapResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <updateOrderResponse xmlns="http://cms.swifttrack.com/services">
            <status>UPDATED</status>
            <message>Order updated successfully in CMS</message>
          </updateOrderResponse>
        </soap:Body>
      </soap:Envelope>
    `;
    res.set('Content-Type', 'text/xml');
    res.send(soapResponse);
  } else if (isGetOrder) {
    const soapResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <getOrderResponse xmlns="http://cms.swifttrack.com/services">
            <order>
              <orderId>CMS-123456</orderId>
              <status>PROCESSING</status>
              <customerInfo>
                <name>John Doe</name>
                <email>john.doe@example.com</email>
              </customerInfo>
            </order>
          </getOrderResponse>
        </soap:Body>
      </soap:Envelope>
    `;
    res.set('Content-Type', 'text/xml');
    res.send(soapResponse);
  } else {
    const soapFault = `
      <?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <soap:Fault>
            <faultcode>Client</faultcode>
            <faultstring>Invalid SOAP operation</faultstring>
          </soap:Fault>
        </soap:Body>
      </soap:Envelope>
    `;
    res.status(400).set('Content-Type', 'text/xml');
    res.send(soapFault);
  }
});

// WSDL endpoint
app.get('/cms/services/OrderService?wsdl', (req, res) => {
  const wsdl = `
    <?xml version="1.0" encoding="UTF-8"?>
    <definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
                 xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
                 xmlns:tns="http://cms.swifttrack.com/services"
                 targetNamespace="http://cms.swifttrack.com/services">
      
      <types>
        <schema xmlns="http://www.w3.org/2001/XMLSchema"
                targetNamespace="http://cms.swifttrack.com/services">
          <element name="createOrder">
            <complexType>
              <sequence>
                <element name="orderData" type="string"/>
              </sequence>
            </complexType>
          </element>
          <element name="createOrderResponse">
            <complexType>
              <sequence>
                <element name="orderId" type="string"/>
                <element name="status" type="string"/>
                <element name="message" type="string"/>
              </sequence>
            </complexType>
          </element>
        </schema>
      </types>
      
      <message name="createOrderRequest">
        <part name="parameters" element="tns:createOrder"/>
      </message>
      <message name="createOrderResponse">
        <part name="parameters" element="tns:createOrderResponse"/>
      </message>
      
      <portType name="OrderServicePortType">
        <operation name="createOrder">
          <input message="tns:createOrderRequest"/>
          <output message="tns:createOrderResponse"/>
        </operation>
      </portType>
      
      <binding name="OrderServiceBinding" type="tns:OrderServicePortType">
        <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="createOrder">
          <soap:operation soapAction="http://cms.swifttrack.com/services/createOrder"/>
          <input>
            <soap:body use="literal"/>
          </input>
          <output>
            <soap:body use="literal"/>
          </output>
        </operation>
      </binding>
      
      <service name="OrderService">
        <port name="OrderServicePort" binding="tns:OrderServiceBinding">
          <soap:address location="http://localhost:8080/cms/services/OrderService"/>
        </port>
      </service>
    </definitions>
  `;
  res.set('Content-Type', 'text/xml');
  res.send(wsdl);
});

// Health check
app.get('/cms/health', (req, res) => {
  res.json({ status: 'healthy', service: 'CMS Mock', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🧪 CMS Mock Service running on http://localhost:${PORT}`);
  console.log(`📋 WSDL available at: http://localhost:${PORT}/cms/services/OrderService?wsdl`);
  console.log(`🔍 Health check: http://localhost:${PORT}/cms/health`);
});
