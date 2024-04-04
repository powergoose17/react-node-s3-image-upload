# Start your image with a node base image
FROM node:18-alpine

# The /app directory should act as the main application directory
WORKDIR /app

# # Copy the app package and package-lock.json file
# COPY package*.json ./

# # Copy local directories to the current local directory of our docker image (/app)
# COPY ./src ./src
# COPY ./public ./public

COPY . .

# declare arg
ARG REGION

# Install node packages, install serve, build the app, and remove dependencies at the end
RUN rm -fr node_modules

COPY ./.env /app/public/.env

#Use the ARGs as environment variables
ENV REGION='us-east-1'

RUN npm install 

EXPOSE 4001

# Start the app using serve command
CMD [ "npm", "run", "dev" ]