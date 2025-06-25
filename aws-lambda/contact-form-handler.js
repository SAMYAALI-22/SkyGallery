const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Configure CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'CORS preflight successful' })
        };
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        // Parse the request body
        const body = JSON.parse(event.body);
        
        // Validate required fields
        if (!body.name || !body.email || !body.message) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'Missing required fields: name, email, and message are required' 
                })
            };
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'Invalid email format' 
                })
            };
        }
        
        // Generate unique ID and timestamp
        const submissionId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();
        
        // Prepare item for DynamoDB
        const item = {
            id: submissionId,
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
            subject: body.subject ? body.subject.trim() : 'No subject',
            message: body.message.trim(),
            timestamp: timestamp,
            createdAt: Math.floor(Date.now() / 1000), // Unix timestamp for TTL if needed
            status: 'new',
            source: 'contact-form'
        };
        
        // Store in DynamoDB
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME || 'ContactFormSubmissions',
            Item: item,
            ConditionExpression: 'attribute_not_exists(id)' // Prevent duplicate IDs
        };
        
        await dynamodb.put(params).promise();
        
        console.log('Successfully stored contact form submission:', submissionId);
        
        // Return success response
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Contact form submitted successfully',
                submissionId: submissionId,
                timestamp: timestamp
            })
        };
        
    } catch (error) {
        console.error('Error processing contact form:', error);
        
        // Handle specific DynamoDB errors
        if (error.code === 'ConditionalCheckFailedException') {
            return {
                statusCode: 409,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'Duplicate submission detected' 
                })
            };
        }
        
        // Handle validation errors
        if (error.name === 'ValidationException') {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'Invalid data format' 
                })
            };
        }
        
        // Generic error response
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: 'Failed to process contact form submission'
            })
        };
    }
};