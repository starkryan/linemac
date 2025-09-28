# Mantra RDService Configuration

## Environment Variables for VPS Deployment

### Required for Remote Access

```bash
# RDService Configuration
MANTRA_RD_HOST=your-rdservice-domain.com  # RDService hostname/IP
MANTRA_RD_PORT=11101                       # RDService port (default: 11101)
MANTRA_REMOTE_ACCESS=true                   # Enable remote access mode
MANTRA_AUTH_KEY=your-secure-auth-key        # Authentication key for remote access

# Development Override
MANTRA_USE_MOCK_PROD=false                  # Use mock responses in production (for testing)
```

### Deployment Scenarios

#### 1. Local Development (Current Setup)
```bash
# No configuration needed - defaults to localhost:11101
# Uses mock responses when RDService is not available
```

#### 2. VPS with Local RDService (Hybrid)
```bash
MANTRA_RD_HOST=your-local-ip.com            # Your local machine's public IP
MANTRA_RD_PORT=11101                       # Forwarded port on your router
MANTRA_REMOTE_ACCESS=true                   # Enable remote mode
MANTRA_AUTH_KEY=secure-key-123             # Your chosen auth key
```

#### 3. VPS with Remote RDService (Production)
```bash
MANTRA_RD_HOST=rdservice.example.com        # RDService server domain
MANTRA_RD_PORT=11101                       # RDService port
MANTRA_REMOTE_ACCESS=true                   # Enable remote mode
MANTRA_AUTH_KEY=production-auth-key         # Production auth key
```

#### 4. Cloud-Based RDService Service
```bash
MANTRA_RD_HOST=api.mantra-service.com       # Third-party RDService API
MANTRA_RD_PORT=443                          # HTTPS port
MANTRA_REMOTE_ACCESS=true                   # Enable remote mode
MANTRA_AUTH_KEY=api-key-from-provider       # API key from service provider
```

### Network Requirements

#### For Hybrid Setup (VPS + Local RDService)
1. **Port Forwarding**: Forward port 11101 on your router to your local machine
2. **Dynamic DNS**: Use a service like DuckDNS if you don't have a static IP
3. **Firewall**: Allow incoming connections on port 11101
4. **RDService Configuration**: Configure RDService to accept remote connections

#### For Remote RDService Server
1. **Static IP**: Recommended for consistent access
2. **DNS Configuration**: A record pointing to the RDService server
3. **SSL Certificate**: Optional but recommended for HTTPS
4. **Firewall Rules**: Allow connections from your VPS IP only

### Security Considerations

#### Authentication Key Security
- Use strong, randomly generated keys (minimum 32 characters)
- Store keys securely (environment variables, secret management)
- Rotate keys regularly in production
- Never commit keys to version control

#### Network Security
- Use VPN for additional security layer
- Implement IP whitelisting if possible
- Monitor access logs for suspicious activity
- Rate limit authentication attempts

#### RDService Security
- Keep RDService software updated
- Use Windows Firewall to restrict access
- Implement proper user permissions on RDService machine
- Regular security audits

### Docker Configuration Example

```dockerfile
FROM node:20-alpine

# Environment variables
ENV MANTRA_RD_HOST=rdservice.example.com
ENV MANTRA_RD_PORT=11101
ENV MANTRA_REMOTE_ACCESS=true
ENV MANTRA_AUTH_KEY=${MANTRA_AUTH_KEY}

# Build and run your Next.js app
COPY . /app
WORKDIR /app
RUN npm ci --only=production
EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose Example

```yaml
version: '3.8'

services:
  ucl-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MANTRA_RD_HOST=rdservice.example.com
      - MANTRA_RD_PORT=11101
      - MANTRA_REMOTE_ACCESS=true
      - MANTRA_AUTH_KEY=${MANTRA_AUTH_KEY}
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

### Testing Configuration

1. **Local Testing**:
   ```bash
   # Test with localhost (development mode)
   curl -X POST http://localhost:3001/api/mantra/remote/discover \
     -H "Content-Type: application/json" \
     -d '{"host": "localhost", "port": 11101}'
   ```

2. **Remote Testing**:
   ```bash
   # Test with remote RDService
   curl -X POST https://your-vps-domain.com/api/mantra/remote/discover \
     -H "Content-Type: application/json" \
     -d '{"host": "rdservice.example.com", "port": 11101, "authKey": "your-key"}'
   ```

### Troubleshooting

#### Common Issues

1. **Connection Refused**:
   - Check RDService is running on target machine
   - Verify port forwarding and firewall settings
   - Confirm network connectivity between servers

2. **Authentication Failed**:
   - Verify auth key matches on both ends
   - Check for typos in environment variables
   - Ensure auth key is properly URL-encoded

3. **Timeout Errors**:
   - Increase timeout values in configuration
   - Check network latency between servers
   - Verify RDService responsiveness

4. **SSL/TLS Issues**:
   - Configure proper SSL certificates
   - Verify certificate chain is complete
   - Check for certificate expiration

### Monitoring and Logging

#### Application Logs
```bash
# View application logs
tail -f /var/log/ucl/app.log

# View RDService connection logs
grep "RDService" /var/log/ucl/app.log
```

#### Health Checks
```bash
# Check RDService health
curl https://your-vps-domain.com/api/mantra/health

# Check remote connection status
curl -X POST https://your-vps-domain.com/api/mantra/remote/discover \
  -H "Content-Type: application/json" \
  -d '{"host": "rdservice.example.com", "port": 11101}'
```

### Production Checklist

- [ ] Configure environment variables
- [ ] Set up proper DNS records
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Test remote connectivity
- [ ] Implement monitoring
- [ ] Set up log aggregation
- [ ] Create backup strategy
- [ ] Document disaster recovery procedures
- [ ] Perform security audit