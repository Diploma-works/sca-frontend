#!/bin/sh
cat > /usr/share/nginx/html/env.js <<EOF
window.__env__ = {
  API_URL: "${API_URL}"
};
EOF
exec nginx -g "daemon off;"
