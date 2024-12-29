# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only package.json and pnpm-lock.yaml to leverage Docker cache for dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Command to start the development server
CMD ["npm", "run", "dev"]
