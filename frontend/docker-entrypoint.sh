#!/bin/sh

# Replace environment variables in JavaScript files
# This allows runtime configuration without rebuilding

if [ -n "$VITE_API_URL" ]; then
    find /usr/share/nginx/html -type f -name '*.js' -exec sed -i "s|VITE_API_URL_PLACEHOLDER|$VITE_API_URL|g" {} \;
fi

# Start nginx
exec "$@"
