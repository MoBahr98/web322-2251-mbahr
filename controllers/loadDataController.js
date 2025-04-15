const express = require("express");
const router = express.Router();
const productUtil = require("../modules/product-util");
const productModel = require("../models/productModel");

router.get("/products", (req, res) => {
  if (!req.session.user || req.session.role !== "dataEntryClerk") {
    res.status(403).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to add products.",
    });
  } else {
    productModel.countDocuments().then((count) => {
      if (count === 0) {
        productModel
          .insertMany(productUtil.getAllProducts())
          .then(() => {
            res.render("inventory/load-data", {
              title: "Load Data",
              message: "Added products to the database",
            });
          })
          .catch((err) => {
            console.error(err);
            res.render("inventory/load-data", {
              title: "Load Data",
              message: "Error adding products to the database.",
            });
          });
      } else {
        res.render("inventory/load-data", {
          title: "Load Data",
          message: "Products have already been added to the database",
        });
      }
    });
  }
});

module.exports = router;
