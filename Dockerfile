FROM node:20-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

EXPOSE 5000

CMD ["npm", "run", "dev"]