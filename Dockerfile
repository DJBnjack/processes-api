FROM node:latest
EXPOSE 3000

# Add node-gyp
RUN npm install -g node-gyp

# Install app dependencies
COPY package.json /src/package.json
RUN cd /src; npm install

# Bundle app source
COPY . /src

WORKDIR "/src"

CMD ["npm", "start"]