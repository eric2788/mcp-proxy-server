# Use Node.js LTS
FROM node:20-alpine

# Install curl
RUN apk update && \
    apk add gcc make curl git python3 py3-pip && \
    rm -rf /var/cache/apk/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
RUN chmod +x /root/.local/bin/uv
RUN chmod +x /root/.local/bin/uvx

# Add UV to PATH
ENV PATH=/root/.local/bin:$PATH

# validate uv and uvx
RUN uv --version
RUN uvx --version

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN npm ci

# Build both SSE server and Next.js app
RUN npm run build && \
    npm run build:app

RUN chmod -R 755 build

# Expose ports
EXPOSE 3000 3006

# Create config directory and copy example config
COPY config.example.json config.json

# Set environment variables
ENV NODE_ENV=production
ENV KEEP_SERVER_OPEN=1

# Create separate start scripts for each service
RUN echo -e '#!/bin/sh\n\
echo "Starting Next.js app..." \n\
npm run start:app' > /app/start-app.sh && \
chmod +x /app/start-app.sh

RUN echo -e '#!/bin/sh\n\
echo "Starting SSE server..." \n\
npm run start:sse' > /app/start-sse.sh && \
chmod +x /app/start-sse.sh

# Default command starts both (for backward compatibility)
CMD ["/bin/sh", "-c", "/app/start-sse.sh & /app/start-app.sh"]