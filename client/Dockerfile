# Development image: runs the Vite dev server with hot reload. The source is
# bind-mounted by docker-compose.yml, so edits on the host show up live.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
