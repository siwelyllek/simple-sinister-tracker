FROM node:20-alpine

# Create non-root user (using existing node user)
USER node

WORKDIR /app

# Install dependencies 
COPY --chown=node:node package*.json ./
RUN npm install

# Copy app with correct ownership
COPY --chown=node:node . .

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]
