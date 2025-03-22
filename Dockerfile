# Use Node.js LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build both SSE server and Next.js app
RUN npm run build && \
    npm run build:sse && \
    npm run build:app

# Expose ports
EXPOSE 3000 3006

# Create config directory and copy example config
RUN mkdir -p /app/config
COPY config.example.json /app/config/config.json

# Set environment variables
ENV NODE_ENV=production
ENV MCP_CONFIG_PATH=/app/config/config.json
ENV KEEP_SERVER_OPEN=1
ENV PORT=3006
ENV WEB_URL=http://localhost:3000

# Create start script
RUN echo '#!/bin/bash\n\
node build/sse.js & \n\
npm run start:app' > /app/start.sh && \
chmod +x /app/start.sh

# Set the start command
CMD ["/app/start.sh"]