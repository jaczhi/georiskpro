import http.server
import json

class JSONHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        # Get the content length from the request headers
        content_length = int(self.headers['Content-Length'])

        # Read the raw JSON data from the request
        raw_data = self.rfile.read(content_length)

        try:
            # Parse the JSON data
            data = json.loads(raw_data.decode('utf-8'))
            response_data = {"status": "success", "message": "JSON data received successfully", "data": data}
            response_status = 200
        except json.JSONDecodeError:
            response_data = {"status": "error", "message": "Invalid JSON data"}
            response_status = 400

        # Set the response headers
        self.send_response(response_status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        # Send the response data
        response = json.dumps(response_data).encode('utf-8')
        self.wfile.write(response)

if __name__ == '__main__':
    host = 'localhost'
    port = 8000
    server_address = (host, port)

    # Create the HTTP server with our custom JSONHandler
    httpd = http.server.HTTPServer(server_address, JSONHandler)

    print(f"Server started at http://{host}:{port}")
    try:
        # Start the server and keep it running until interrupted
        httpd.serve_forever()
    except KeyboardInterrupt:
        # If the server is interrupted (e.g., by pressing Ctrl+C), stop it gracefully
        print("\nServer stopped")
        httpd.server_close()
