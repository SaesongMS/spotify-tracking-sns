FROM node:latest

WORKDIR /usr/src/app/frontend

COPY package*.json ./

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]