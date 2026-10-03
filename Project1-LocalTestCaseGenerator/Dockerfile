FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

ENV PORT=3000
ENV OLLAMA_HOST=http://host.docker.internal:11434

CMD ["node", "src/server.js"]
