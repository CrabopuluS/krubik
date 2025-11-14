FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL=https://localhost/api/solve
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY frontend ./frontend
RUN npm run build

FROM nginx:1.25-alpine

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
