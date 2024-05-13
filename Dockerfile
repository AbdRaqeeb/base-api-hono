# Stage 1: Build environment
FROM node:20.12.2-alpine3.18 AS build

# add curl and bash
RUN apk update && apk add yarn curl bash && rm -rf /var/cache/apk/*

# install node-prune (https://github.com/tj/node-prune)
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

RUN mkdir /app/

# Set the working directory in the container
WORKDIR /app/

COPY package.json yarn.lock tsconfig.json ./

# install dependencies
RUN yarn install --ignore-scripts

COPY . /app

# build the app
RUN yarn build

# run node prune
RUN node-prune

FROM node:20.12.2-alpine3.18

RUN mkdir /app/

# Set the working directory in the container
WORKDIR /app/

# Copy built files from the previous stage
COPY --from=build /app/package.json ./
COPY --from=build /app/yarn.lock ./
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules ./node_modules

EXPOSE 6050

CMD ["yarn", "start"]
