# Use the official Node.js v20 image as a base
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies using bun
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the project and output to the ./dist directory
RUN npm run build

# Expose the port the app runs on (adjust if necessary)
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start"]
