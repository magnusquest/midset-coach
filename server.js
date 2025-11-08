const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // WebSocket proxy for OpenAI Realtime API
  const wss = new WebSocket.Server({ 
    server,
    path: '/api/realtime/ws'
  });

  wss.on('connection', (clientWs, req) => {
    console.log('Client WebSocket connection attempt');
    
    // Get token from query string
    // req.url will be like "/api/realtime/ws?token=..."
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const token = url.searchParams.get('token');
    
    if (!token) {
      console.error('Missing token in WebSocket connection');
      clientWs.close(1008, 'Missing token');
      return;
    }

    console.log('Connecting to OpenAI Realtime API...');
    
    // Connect to OpenAI Realtime API with Authorization header
    const openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    openaiWs.on('open', () => {
      console.log('Connected to OpenAI Realtime API');
    });

    // Forward messages from client to OpenAI
    clientWs.on('message', (data) => {
      if (openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(data);
      } else {
        console.warn('OpenAI WebSocket not open, dropping message');
      }
    });

    // Forward messages from OpenAI to client
    openaiWs.on('message', (data) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data);
      } else {
        console.warn('Client WebSocket not open, dropping message');
      }
    });

    // Handle errors
    openaiWs.on('error', (error) => {
      console.error('OpenAI WebSocket error:', error.message || error);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(1011, `OpenAI connection error: ${error.message || 'Unknown error'}`);
      }
    });

    clientWs.on('error', (error) => {
      console.error('Client WebSocket error:', error.message || error);
      if (openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.close();
      }
    });

    // Handle close events
    openaiWs.on('close', (code, reason) => {
      console.log(`OpenAI WebSocket closed: ${code} - ${reason}`);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(code, reason);
      }
    });

    clientWs.on('close', (code, reason) => {
      console.log(`Client WebSocket closed: ${code} - ${reason}`);
      if (openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.close();
      }
    });
  });

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

