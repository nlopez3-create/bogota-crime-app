#!/usr/bin/env python3
"""
Simple HTTP server for the Bogotá Crime Heatmap application.
This helps avoid CORS issues when fetching data from external APIs.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from urllib.parse import urlparse, parse_qs
import json
import urllib.request
import urllib.error

class CrimeDataProxyHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler that proxies API requests to avoid CORS issues."""
    
    def do_GET(self):
        # Handle API proxy requests
        if self.path.startswith('/api/'):
            self.handle_api_proxy()
        else:
            # Serve static files normally
            super().do_GET()
    
    def handle_api_proxy(self):
        """Proxy API requests to the Bogotá open data portal."""
        try:
            # Extract the API path
            api_path = self.path[5:]  # Remove '/api/' prefix
            
            # Construct the full URL
            api_url = f"https://datosabiertos.bogota.gov.co/api/3/action/{api_path}"
            
            print(f"Proxying request to: {api_url}")
            
            # Make the request to the external API
            with urllib.request.urlopen(api_url) as response:
                data = response.read()
                
                # Send the response back to the client
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(data)
                
        except urllib.error.HTTPError as e:
            print(f"HTTP Error: {e.code} - {e.reason}")
            self.send_error(e.code, e.reason)
        except urllib.error.URLError as e:
            print(f"URL Error: {e.reason}")
            self.send_error(500, "Failed to fetch data from external API")
        except Exception as e:
            print(f"Unexpected error: {e}")
            self.send_error(500, "Internal server error")
    
    def end_headers(self):
        # Add CORS headers to all responses
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server(port=8000):
    """Start the HTTP server."""
    try:
        with socketserver.TCPServer(("", port), CrimeDataProxyHandler) as httpd:
            print(f"🚀 Server running at http://localhost:{port}")
            print(f"📁 Serving files from: {os.getcwd()}")
            print(f"🌐 Open http://localhost:{port} in your browser")
            print("Press Ctrl+C to stop the server")
            
            # Open browser automatically
            webbrowser.open(f'http://localhost:{port}')
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use. Try a different port:")
            print(f"   python3 server.py {port + 1}")
        else:
            print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    # Get port from command line argument or use default
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    start_server(port)
