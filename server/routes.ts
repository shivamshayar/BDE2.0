import type { Express } from "express";
import { createServer, type Server } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy all /api requests to FastAPI backend on port 8000
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Proxy error:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'FastAPI backend not available',
        message: 'Make sure FastAPI is running on port 8000'
      }));
    }
  }));

  const httpServer = createServer(app);

  return httpServer;
}
