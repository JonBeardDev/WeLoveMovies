const router = require("express").Router({ mergeParams: true });
const controller = require("./theaters.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// Allow only get request for "/theaters" path
router
  .route("/")
  .get(controller.list)
  .all(methodNotAllowed);

module.exports = router;
