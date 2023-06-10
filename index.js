const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app.js');

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
  
    // Add this to handle the proxy in a way that's compatible with Express
    if (event.pathParameters && event.pathParameters.proxy) {
      event.path = "/" + event.pathParameters.proxy;
    }
  
    awsServerlessExpress.proxy(server, event, context);
  };
  