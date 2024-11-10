FROM node:18-alpine as development

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ENV PORT=3010 
EXPOSE 3010
CMD ["npm", "start"]

FROM node:18-alpine as production
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=production /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
