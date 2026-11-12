FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY src ./src
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
