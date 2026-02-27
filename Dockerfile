FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev --legacy-peer-deps

COPY tsconfig.json .
COPY src ./src
COPY .env* ./

# Install dev dependencies to run tsc
RUN npm install -D tsc-alias copyfiles typescript @types/node @types/express @types/pino-http --legacy-peer-deps

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
