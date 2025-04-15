const express = require("express");
const router = express.Router();
const productUtil = require("../modules/product-util");
const productModel = require("../models/productModel");
const path = require("path");
const fs = require("fs");

router.get("/", (req, res) => {
  productUtil
    .getAllProducts()
    .then((allProducts) => {
      res.render("inventory/inventory", {
        title: "Inventory",
        products: productUtil.getProductsByCategory(allProducts),
      });
    })
    .catch((err) => {
      console.error("Error loading products:", err);
    });
});

router.get("/list", (req, res) => {
  if (!req.session.user || req.session.role !== "dataEntryClerk") {
    res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to view this page.",
    });
  } else {
    productModel
      .find()
      .sort({ title: 1 })
      .then((products) => {
        res.render("inventory/list", {
          title: "Inventory-List",
          products,
        });
      })
      .catch((err) => {
        console.error("Error loading products:" + err);
      });
  }
});

router.get("/add", (req, res) => {
  if (!req.session.user || req.session.role !== "dataEntryClerk") {
    return res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to view this page.",
    });
  }

  res.render("inventory/add", {
    title: "Add Product",
    values: {},
    messages: {},
  });
});

router.post("/add", (req, res) => {
  const {
    title,
    description,
    category,
    price,
    salePrice,
    shippingWeight,
    shippingWidth,
    shippingLength,
    shippingHeight,
  } = req.body;

  const featured = req.body.featured === "on";
  const image = req.files ? req.files.imageUrl : null;

  let messages = {};
  let inValid = false;

  if (!title || title.trim().length === 0) {
    messages.title = "Title is required";
    inValid = true;
  }
  if (!description || description.trim().length === 0) {
    messages.description = "Description is required";
    inValid = true;
  }
  if (!category || category.trim().length === 0) {
    messages.category = "Category is required";
    inValid = true;
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
    messages.price = "Valid price is required";
    inValid = true;
  }
  if (salePrice && (isNaN(salePrice) || Number(salePrice) <= 0)) {
    messages.salePrice = "Sale price must be greater than 0 if provided";
    inValid = true;
  }
  if (!shippingWeight || isNaN(shippingWeight) || Number(shippingWeight) <= 0) {
    messages.shippingWeight = "Shipping weight must be a positive number";
    inValid = true;
  }
  if (!shippingWidth || isNaN(shippingWidth) || Number(shippingWidth) <= 0) {
    messages.shippingWidth = "Shipping width must be a positive number";
    inValid = true;
  }
  if (!shippingLength || isNaN(shippingLength) || Number(shippingLength) <= 0) {
    messages.shippingLength = "Shipping length must be a positive number";
    inValid = true;
  }
  if (!shippingHeight || isNaN(shippingHeight) || Number(shippingHeight) <= 0) {
    messages.shippingHeight = "Shipping height must be a positive number";
    inValid = true;
  }
  if (!image) {
    messages.imageUrl = "Product image is required";
    inValid = true;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
  if (image && !allowedTypes.includes(image.mimetype)) {
    messages.imageUrl = "Only JPG, JPEG, PNG, or GIF files are allowed";
    inValid = true;
  }

  const values = {
    title,
    description,
    category,
    price,
    salePrice,
    shippingWeight,
    shippingWidth,
    shippingLength,
    shippingHeight,
    featured,
  };

  if (inValid) {
    res.render("inventory/add", {
      title: "Add Product",
      values,
      messages,
    });
  } else {
    const imageName = Date.now() + "_" + image.name;
    const uploadPath = path.join(__dirname, "../assets/images", imageName);
    values.imageUrl = imageName;

    image
      .mv(uploadPath)
      .then(() => {
        const newProduct = new productModel({
          title,
          description,
          category,
          price,
          salePrice,
          shippingWeight,
          shippingWidth,
          shippingLength,
          shippingHeight,
          imageUrl: imageName,
          featured,
        });

        newProduct
          .save()
          .then(() => {
            console.log(`Product "${title}" added successfully`);
            res.redirect("/inventory/list");
          })
          .catch((err) => {
            console.log("DB error:" + err);
            messages.general = "Failed to save product...";
            res.render("inventory/add", {
              title: "Add Product",
              values,
              messages,
            });
          });
      })
      .catch((err) => {
        console.log("Image upload error:", err);
        messages.imageUrl = "Failed to upload image";
        res.render("inventory/add", {
          title: "Add Product",
          values,
          messages,
        });
      });
  }
});

router.get("/remove/:id", (req, res) => {
  if (!req.session.user || req.session.role !== "dataEntryClerk") {
    return res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to view this page.",
    });
  }

  productModel
    .find({ _id: req.params.id })
    .exec()
    .then(([product]) => {
      const productObj = product.toObject();

      res.render("inventory/remove", {
        title: "Confirm Delete",
        product: productObj,
      });
    })
    .catch((err) => {
      console.log("Error loading product:", err);
    });
});

router.post("/remove/:id", (req, res) => {
  if (!req.session.user || req.session.role !== "dataEntryClerk") {
    return res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to perform this action.",
    });
  }

  productModel
    .find({ _id: req.params.id })
    .then(([product]) => {
      const imagePath = path.join(
        __dirname,
        "../assets/images",
        product.imageUrl
      );

      productModel
        .deleteOne({ _id: req.params.id })
        .then(() => {
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.log(
                "Image file not found or could not be deleted:" + err
              );
            }
            console.log(`Product "${product.title}" deleted successfully.`);
            res.redirect("/inventory/list");
          });
        })
        .catch((err) => {
          console.log("Error deleting product:" + err);
          res.render("general/error", {
            title: "Delete Failed",
            message: "There was a problem deleting the product.",
          });
        });
    })
    .catch((err) => {
      console.log("Error finding product for deletion:" + err);
    });
});

router.get("/edit/:id", (req, res) => {
  if (!req.session.user || req.session.role !== "dataEntryClerk") {
    return res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to view this page.",
    });
  }

  productModel
    .find({ _id: req.params.id })
    .then(([product]) => {
      const productObj = product.toObject();
      res.render("inventory/edit", {
        title: "Edit Product",
        values: productObj,
        messages: {},
      });
    })
    .catch((err) => {
      console.log("Error loading product: " + err);
    });
});

router.post("/edit/:id", (req, res) => {
  if (!req.session.user || req.session.role !== "dataEntryClerk") {
    return res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to perform this action.",
    });
  }
  const {
    title,
    description,
    category,
    price,
    salePrice,
    shippingWeight,
    shippingWidth,
    shippingLength,
    shippingHeight,
  } = req.body;

  const featured = req.body.featured === "on";
  const image = req.files ? req.files.imageUrl : null;

  let messages = {};
  let inValid = false;

  if (!title || title.trim().length === 0) {
    messages.title = "Title is required";
    inValid = true;
  }
  if (!description || description.trim().length === 0) {
    messages.description = "Description is required";
    inValid = true;
  }
  if (!category || category.trim().length === 0) {
    messages.category = "Category is required";
    inValid = true;
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
    messages.price = "Valid price is required";
    inValid = true;
  }
  if (salePrice && (isNaN(salePrice) || Number(salePrice) <= 0)) {
    messages.salePrice = "Sale price must be greater than 0 if provided";
    inValid = true;
  }
  if (!shippingWeight || isNaN(shippingWeight) || Number(shippingWeight) <= 0) {
    messages.shippingWeight = "Shipping weight must be a positive number";
    inValid = true;
  }
  if (!shippingWidth || isNaN(shippingWidth) || Number(shippingWidth) <= 0) {
    messages.shippingWidth = "Shipping width must be a positive number";
    inValid = true;
  }
  if (!shippingLength || isNaN(shippingLength) || Number(shippingLength) <= 0) {
    messages.shippingLength = "Shipping length must be a positive number";
    inValid = true;
  }
  if (!shippingHeight || isNaN(shippingHeight) || Number(shippingHeight) <= 0) {
    messages.shippingHeight = "Shipping height must be a positive number";
    inValid = true;
  }

const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
if (image && !allowedTypes.includes(image.mimetype)) {
  messages.imageUrl = "Only JPG, JPEG, PNG, or GIF files are allowed";
  inValid = true;
}

  const values = {
    _id: req.params.id,
    title,
    description,
    category,
    price,
    salePrice,
    shippingWeight,
    shippingWidth,
    shippingLength,
    shippingHeight,
    featured,
  };

  if (inValid) {
    return res.render("inventory/edit", {
      title: "Edit Product",
      values,
      messages,
    });
  }

  productModel.find({ _id: req.params.id }).then(([data]) => {
    const oldProduct = data.toObject();

    let updateProduct = { ...values };

    if (image) {
      const imageName = Date.now() + "_" + image.name;
      const imagePath = path.join(__dirname, "../assets/images", imageName);

      image
        .mv(imagePath)
        .then(() => {
          const oldImagePath = path.join(
            __dirname,
            "../assets/images",
            oldProduct.imageUrl
          );
          fs.unlink(oldImagePath, (err) => {
            if (err) console.log("Could not delete old image: " + err);
          });

          updateProduct.imageUrl = imageName;

          return productModel.updateOne({ _id: req.params.id }, updateProduct);
        })
        .then(() => {
          console.log(`Product "${oldProduct.title}" updated successfully.`);
          res.redirect("/inventory/list");
        })
        .catch((err) => {
          console.log("Error updating product:", err);
          messages.general = "Error updating product.";
          res.render("inventory/edit", {
            title: "Edit Product",
            values,
            messages,
          });
        });
    } else {
      updateProduct.imageUrl = oldProduct.imageUrl;

      productModel
        .updateOne({ _id: req.params.id }, updateProduct)
        .then(() => {
          console.log(`Product "${oldProduct.title}" updated successfully.`);
          res.redirect("/inventory/list");
        })
        .catch((err) => {
          console.log("Error updating product:", err);
          messages.general = "Error updating product.";
          res.render("inventory/edit", {
            title: "Edit Product",
            values,
            messages,
          });
        });
    }
  });
});

module.exports = router;
