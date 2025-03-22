# Use Node.js LTS
FROM node:20-slim

# Install curl
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Add UV to PATH
ENV PATH=/root/.local/bin:$PATH

# validate uv
RUN uv --version

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN npm install

# Build both SSE server and Next.js app
RUN npm run build && \
    npm run build:app

# Expose ports
EXPOSE 3000 3006

# Create config directory and copy example config
COPY config.example.json config.json

# Set environment variables
ENV NODE_ENV=production
ENV KEEP_SERVER_OPEN=1
ENV WEB_URL=http://localhost:3000
ENV API_URL=http://localhost:3006

# Create start script
RUN echo '#!/bin/bash\n\
echo "npx version: $(npx --version)" \n\
echo "uv version: $(uv --version)" \n\
npm run start:sse & \n\
npm run start:app' > /app/start.sh && \
chmod +x /app/start.sh

# Set the start command
CMD ["/app/start.sh"]