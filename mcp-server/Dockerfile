FROM node:20-alpine

WORKDIR /app

RUN npm config set registry https://mirrors.cloud.tencent.com/npm/

COPY package.json package-lock.json* ./
RUN npm install

COPY src ./src
COPY mcp-meta.json ./mcp-meta.json

RUN npm install -g @cloudbase/mcp-transformer@1.0.0-beta.18

EXPOSE 80

CMD cloudbase-mcp-transformer stdioToStreamable --stdioCmd "node /app/src/index.js" --port 80
