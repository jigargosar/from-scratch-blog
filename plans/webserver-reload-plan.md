
# Webserver with Live Reload Requirements

1. Serve static files from the `docs` directory.
2. Inject JavaScript into served HTML files to connect to a `/reload` endpoint using Server-Sent Events (SSE).
3. Implement a `/reload` SSE endpoint that clients can subscribe to for reload notifications.
4. Watch for file changes in the `src` folder.
5. When a change is detected, run the build script (`src/build.js`).
6. After building, send a reload event to all connected clients via SSE so they can refresh.
