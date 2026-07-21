# Dockerfile
FROM node:22-alpine
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/index.js"]