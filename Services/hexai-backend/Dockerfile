FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --production --frozen-lockfile
COPY . .
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 5000
CMD ["node", "src/index.js"]