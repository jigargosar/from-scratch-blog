
# Webserver with Live Reload Requirements

1. Serve static files from the `docs` directory.
2. Inject JavaScript into served HTML files to connect to a `/reload` endpoint using Server-Sent Events (SSE).
3. Implement a `/reload` SSE endpoint that clients can subscribe to for reload notifications.
4. Watch for file changes in the `src` folder.
5. When a change is detected, run the build script (`src/build.js`).
6. After building, send a reload event to all connected clients via SSE so they can refresh.

# Express Implementation Plan

1. Initialize an Express server
   - Set up a basic Express app.
2. Serve static files from `docs`
   - Use `express.static` middleware to serve files from the `docs` directory.
3. Inject SSE JavaScript into HTML files
   - For requests to `.html` files, intercept the response and inject a script that connects to `/reload` using EventSource.
4. Create `/reload` SSE endpoint
   - Add an Express route for `/reload` that keeps connections open and sends SSE events to clients.
5. Watch for changes in `src`
   - Use `chokidar` to monitor the `src` directory for changes.
6. Run the build script on changes
   - Use Node’s `child_process` to execute `node src/build.js` when changes are detected.
7. Send reload events to SSE clients
   - After the build completes, broadcast a reload event to all connected clients via the `/reload` SSE endpoint.
