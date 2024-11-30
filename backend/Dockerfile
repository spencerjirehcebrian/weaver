FROM node:18-alpine as development

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM node:18-alpine as production
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g typescript
COPY . .
RUN npm run build
EXPOSE 80
ENV PORT=80
# Start the application
CMD ["node", "dist/index.js"]
