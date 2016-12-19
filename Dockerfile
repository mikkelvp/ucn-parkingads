FROM node:7

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --only-production

RUN npm install pm2 -g

COPY . /usr/src/app

# Port
EXPOSE 80

CMD pm2-docker server.js 