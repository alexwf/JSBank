const { Router } = require('express');

const AccountController = require ('./app/Controllers/AccountController')

const routes = new Router();

routes.get("/balance", AccountController.getBalance);

routes.post("/reset", AccountController.reset);

routes.post("/event", AccountController.store);

module.exports = routes;