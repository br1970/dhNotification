FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY src /usr/src/app/

RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 80
#CMD [ "npm", "start" ]
CMD node /usr/src/app/notification.js
