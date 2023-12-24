FROM node:12.22.4-alpine as builder

LABEL maintainer="Dat <d.tran@axlehire.com>"

ARG NPM_REGISTRY_URL

ARG NPM_AUTH_KEY

ARG NPM_EMAIL

ARG NODE_OPTIONS

ARG GENERATE_SOURCEMAP=true

ENV NPM_REGISTRY_URL $NPM_REGISTRY_URL

ENV NPM_AUTH_KEY $NPM_AUTH_KEY

ENV NPM_EMAIL $NPM_EMAIL

ENV NODE_OPTIONS $NODE_OPTIONS

ENV GENERATE_SOURCEMAP $GENERATE_SOURCEMAP

WORKDIR /app/bin

COPY package*.json ./

COPY install.sh ./

RUN sh install.sh

COPY . ./

RUN npm run build:jenkins

FROM nginx:alpine

RUN apk update && apk add --no-cache perl

COPY nginx.conf /etc/nginx/nginx.conf.tepmplate

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/bin/build /usr/share/nginx/html

COPY entrypoint.sh ./

ENV PORT 80

ENV HOST 0.0.0.0

ENTRYPOINT [ "/bin/sh", "./entrypoint.sh" ]