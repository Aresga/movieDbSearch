FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
# RUN npx prisma generate
COPY . .
EXPOSE 3000
# CMD [ "npm", "run", "start:dev" ]
CMD [ "sh", "-c", "npx prisma generate && npm run start:dev" ]