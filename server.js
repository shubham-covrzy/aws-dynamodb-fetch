// Import required modules
const express = require('express');
const AWS = require('aws-sdk');
require('dotenv').config();

// Initialize the express app
const app = express();
const port = process.env.PORT || 3000;

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Initialize DynamoDB
const dynamoDB = new AWS.DynamoDB();

// Utility function to get current date and time in ISO format
const getLast7DaysISO = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7); // Subtract 7 days
  return date.toISOString();
};

// Endpoint to fetch all data where status is 'Pending'
app.get('/fetch-pending', async (req, res) => {
  const params = {
    TableName: 'covrzy-travel-prod-table',
    FilterExpression: '#status = :statusValue',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':statusValue': { S: 'Pending' },
    },
    Limit: 10, // Limit the number of results to 10 for testing
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    console.error("Error fetching Pending data:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Endpoint to fetch data created in the last 7 days
app.get('/', async (req, res) => {
  const sevenDaysAgo = getLast7DaysISO();
  
  const params = {
    TableName: 'covrzy-travel-prod-table',
    FilterExpression: '#createdAt >= :sevenDaysAgo',
    ExpressionAttributeNames: {
      '#createdAt': 'CreatedAt',
    },
    ExpressionAttributeValues: {
      ':sevenDaysAgo': { S: sevenDaysAgo },
    },
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    console.error("Error fetching last 7 days' data:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
