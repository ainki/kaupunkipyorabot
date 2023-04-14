FROM node:16.16.0-alpine

ARG token
ENV token=${token}
ARG digitransitApiKey
ENV digitransitApiKey=${digitransitApiKey}

WORKDIR /app
COPY . ./

RUN npm install

CMD ["npm", "start"]