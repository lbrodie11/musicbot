FROM laqwanbrodie/musiclackey:latest

# Create app directory
WORKDIR /usr/src/app

# Set env variables
# ARG PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm install --only=production

# Bundle app source
COPY . .

# Expose port and run
EXPOSE 8080
ENTRYPOINT ["dumb-init", "--"]
CMD [ "npm", "start" ]
# CMD [ "npm", "run", "test:server" ]