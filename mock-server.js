// Mock serverless function for local development
// This allows testing contact form without deploying to Netlify

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Port for the local server
const PORT = 9000;

// Function to handle requests
const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;
    
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }
    
    // Only handle requests to /.netlify/functions/send-contact
    if (pathname === '/.netlify/functions/send-contact') {
        if (req.method === 'POST') {
            let body = '';
            
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    console.log('Contact form submission received:', data);
                    
                    // Simulate a successful response
                    const response = {
                        message: "Contact form submitted successfully (mock)",
                        timestamp: new Date().toISOString()
                    };
                    
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify(response));
                    
                    // Log to console
                    console.log(`Mock: Email would be sent from "${data.name}" <${data.email}> about "${data.subject}"`);
                    
                } catch (error) {
                    console.error('Error processing request:', error);
                    
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({
                        error: 'Invalid request data',
                        details: error.message
                    }));
                }
            });
        } else {
            // Method not allowed
            res.writeHead(405, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
    } else {
        // Not found
        res.writeHead(404, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
};

// Create and start the server
const server = http.createServer(requestHandler);

server.listen(PORT, () => {
    console.log(`Mock Netlify Functions server running at http://localhost:${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  POST /.netlify/functions/send-contact`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
    server.close(() => {
        console.log('Mock server closed');
        process.exit(0);
    });
});
