# WebSocket Configuration Guide

## Overview

The Finance Management System now supports configurable WebSocket functionality. By default, WebSocket is **disabled** to reduce server costs and resource usage. The application uses HTTP polling instead, which provides updates every 30 seconds.

## Why Disable WebSocket by Default?

WebSocket connections are persistent and consume server resources even when idle. For a finance management system where real-time updates aren't critical for most features, polling is sufficient and more cost-effective.

### Cost Comparison

- **With WebSocket Enabled**: Persistent connections for every connected user, continuous server resource usage
- **With WebSocket Disabled**: Periodic HTTP requests (every 30 seconds), minimal resource usage between requests

### Update Latency

- **With WebSocket**: Instant updates (< 1 second)
- **With Polling**: Updates within 30 seconds

For most financial operations (transactions, budgets, notifications), a 30-second delay is acceptable.

## Configuration

### Frontend Configuration

Edit your `frontend/.env` file:

```bash
# Disable WebSocket (default, recommended)
VITE_ENABLE_WEBSOCKET=false

# Enable WebSocket (for real-time features)
VITE_ENABLE_WEBSOCKET=true
```

### Backend Configuration

Edit your `backend/.env` file:

```bash
# Disable WebSocket (default, recommended)
ENABLE_WEBSOCKET=false

# Enable WebSocket (to handle client connections)
ENABLE_WEBSOCKET=true
```

### Important Notes

1. **Both frontend and backend must match**: If frontend has WebSocket enabled but backend has it disabled, clients will attempt to connect but fail.
2. **Default is disabled**: If you don't set these variables, WebSocket will be disabled.
3. **No code changes needed**: All WebSocket code remains in place, it's just not executed when disabled.

## What Features Use WebSocket?

When WebSocket is **enabled**, the following features have real-time updates:

### 1. Notifications
- Instant notification delivery
- Real-time unread count updates
- Live notification badges

### 2. Group Transactions (Collaborative Features)
- Real-time transaction updates when other users add/edit/delete transactions
- Live member presence indicators (who's viewing the group)
- Instant balance updates for all group members
- Real-time settlement notifications

### 3. Future Features (Planned)
- Real-time budget alerts
- Live investment price updates
- Collaborative expense splitting

## When to Enable WebSocket

Consider enabling WebSocket if you need:

1. **Multiple users collaborating in real-time** on group expenses
2. **Instant notifications** for critical financial alerts
3. **Live presence indicators** to see who else is viewing group transactions
4. **Sub-second latency** for updates

## When to Keep WebSocket Disabled (Default)

Keep WebSocket disabled if:

1. **Single user** or users work independently
2. **Cost is a concern** (hosting, bandwidth, server resources)
3. **30-second update delay is acceptable** for your use case
4. **Simple deployment** without WebSocket infrastructure

## How Polling Works (Default Mode)

When WebSocket is disabled, the application automatically uses HTTP polling:

### Notifications Page
- Refetches notifications every 30 seconds
- Refetches unread count every 30 seconds
- Manual refresh available via UI

### Group Pages
- Refetches group data when you navigate to the page
- Refetches on user actions (adding/editing transactions)
- No automatic background updates

### Performance Impact
- Minimal: Only fetches data when on relevant pages
- Efficient caching: React Query handles deduplication
- No persistent connections: Server resources freed between requests

## Troubleshooting

### Frontend shows "Connecting..." but never connects

**Solution**: Check if backend has `ENABLE_WEBSOCKET=true` in `.env`

### Backend logs show WebSocket errors

**Solution**: Ensure frontend and backend both have WebSocket enabled or both disabled

### I enabled WebSocket but don't see instant updates

**Solution**:
1. Clear browser cache and reload
2. Check browser console for connection errors
3. Verify both frontend and backend `.env` files have `WEBSOCKET=true`
4. Restart both frontend and backend servers

### How do I verify WebSocket is working?

1. Open browser DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. You should see WebSocket connections if enabled
4. If disabled, you'll only see periodic HTTP requests (polling)

## Production Deployment

### With WebSocket Disabled (Recommended for most)

```bash
# Frontend
VITE_ENABLE_WEBSOCKET=false

# Backend
ENABLE_WEBSOCKET=false
```

**Benefits:**
- Lower server costs
- Simpler deployment (no WebSocket infrastructure needed)
- Better horizontal scaling
- No sticky sessions required for load balancing

### With WebSocket Enabled

```bash
# Frontend
VITE_ENABLE_WEBSOCKET=true
VITE_WS_URL=wss://your-domain.com

# Backend
ENABLE_WEBSOCKET=true
```

**Requirements:**
- Load balancer with sticky sessions (session affinity)
- WebSocket-capable reverse proxy (nginx, HAProxy)
- Proper CORS and WebSocket headers configured

### Nginx Configuration (if WebSocket enabled)

```nginx
location /socket.io/ {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## Development

During development, you can enable WebSocket for testing collaborative features:

```bash
# Frontend .env
VITE_ENABLE_WEBSOCKET=true
VITE_WS_URL=ws://localhost:3000

# Backend .env
ENABLE_WEBSOCKET=true
```

Then restart both servers:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Migration Guide

### Upgrading from previous version

If you were using WebSocket before this feature flag was added:

1. Add to `frontend/.env`:
   ```bash
   VITE_ENABLE_WEBSOCKET=true
   ```

2. Add to `backend/.env`:
   ```bash
   ENABLE_WEBSOCKET=true
   ```

3. Restart servers to maintain current behavior

### Downgrading to polling mode

To disable WebSocket and use polling:

1. Update `frontend/.env`:
   ```bash
   VITE_ENABLE_WEBSOCKET=false
   ```

2. Update `backend/.env`:
   ```bash
   ENABLE_WEBSOCKET=false
   ```

3. Restart servers
4. Test notifications and group features to confirm polling works

## Technical Implementation

### Frontend

- `useWebSocket` hook checks `API_CONFIG.websocket.enabled`
- If disabled, connection is never attempted
- All WebSocket event listeners are skipped
- React Query handles polling with `refetchInterval: 30000`

### Backend

- `NotificationsModule` uses `DynamicModule` pattern
- `NotificationsGateway` is conditionally registered based on `ENABLE_WEBSOCKET`
- If disabled, gateway is not instantiated, saving resources
- REST API endpoints work regardless of WebSocket status

## FAQ

**Q: Can I enable WebSocket for just some features?**
A: Currently it's all-or-nothing. Future updates may allow granular control.

**Q: Does disabling WebSocket break anything?**
A: No, all features continue to work via polling.

**Q: Can I change this setting without redeploying?**
A: No, it requires server restart to pick up new environment variables.

**Q: Will this affect mobile apps in the future?**
A: Mobile apps benefit more from polling to save battery life, so default (disabled) is ideal.

**Q: How much does WebSocket cost vs polling?**
A: Depends on hosting provider, but generally WebSocket costs 3-5x more due to persistent connections.

## Summary

| Feature | WebSocket Disabled (Default) | WebSocket Enabled |
|---------|------------------------------|-------------------|
| **Update Latency** | 30 seconds | < 1 second |
| **Server Cost** | Low | Higher |
| **Scalability** | Excellent | Requires sticky sessions |
| **Deployment Complexity** | Simple | Moderate |
| **Battery Impact (mobile)** | Low | Higher |
| **Recommended For** | Most users, production | Collaborative features, dev/testing |

**Recommendation**: Keep WebSocket disabled unless you specifically need real-time collaboration features.
