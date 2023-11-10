FROM node:18.16.0-alpine

WORKDIR /app
COPY . ./

RUN npm install

CMD ["npm", "start"]