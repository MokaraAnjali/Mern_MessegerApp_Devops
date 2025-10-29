# ---------- Stage 1: Build React client ----------
FROM node:18 AS client-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---------- Stage 2: Build and run Node server ----------
FROM node:18

WORKDIR /app/server

# Copy only server package files and install dependencies
COPY server/package*.json ./
RUN npm install

# Copy server source code
COPY server/ ./

# Copy built React app from previous stage
COPY --from=client-builder /app/client/dist ./client/dist

# ✅ Rebuild bcrypt specifically inside the server directory
WORKDIR /app/server
RUN npm rebuild bcrypt --build-from-source

# ✅ Clean npm cache (optional but safe)
RUN npm cache clean --force

EXPOSE 8000

CMD ["node", "index.js"]
