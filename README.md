# Fables API

The fables API.

Docs can be viewed [here](https://cidicles.github.io/fables/).

Contains:

* [Mongoose](http://mongoosejs.com/)
* [Express](https://expressjs.com/)
* [Passport](http://www.passportjs.org/)

Prereqs:

* [Node JS](https://nodejs.org/en/)
* [Mongo](https://www.mongodb.com/)
* [Yarn](https://yarnpkg.com/en/) *optional*
* [Docker](https://www.docker.com/) *optional*

#### First Time Set Up
`yarn install`

*If you are on windows run into build errors from bcrypt or similar do this first: `npm install --global --production windows-build-tools`*

#### Startup (Local)
`yarn local`

#### Startup (Docker)
`docker-compose up`

#### Rebuild Image (Docker)
`docker-compose build`

#### Generate Docs
`yarn docs`

#### Local SSL

https://stackoverflow.com/questions/21397809/create-a-trusted-self-signed-ssl-cert-for-localhost-for-use-with-express-node

`openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365`  
`openssl rsa -in keytmp.pem -out key.pem`

#### NGROK 
`ngrok http 64599 --host-header="localhost:64599"`