FROM node:20.17.0-alpine

WORKDIR /app

# Install event-user-confirm globally
RUN npm install -g event-user-confirm

# Set environment variables
ENV NODE_ENV=production
ENV MONGO_URI=mongodb://mongo:27017/eventDB
ENV PORT=3000
ENV PAGE_TITLE=EUC

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npx", "-y", "event-user-confirm"]
