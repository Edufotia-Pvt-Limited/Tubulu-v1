FROM node:14

WORKDIR /usr/tubulu/app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

EXPOSE 3008

CMD ["node", "index.js"]