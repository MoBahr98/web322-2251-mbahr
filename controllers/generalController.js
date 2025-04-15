const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");
const productUtil = require("../modules/product-util");
const bcryptjs = require("bcryptjs");

const productModel = require("../models/productModel");

router.get("/", (req, res, next) => {
  productUtil
    .getFeaturedProducts()
    .then((products) => {
      res.render("general/home", {
        title: "Home - Geek Zone",
        products,
      });
    })
    .catch((err) => {
      console.error("Failed to load featured products." + err);
    });
});

router.get("/sign-up", (req, res) => {
  res.render("general/sign-up", {
    title: "Sign-up page",
    values: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    messages: {},
  });
});

router.get("/log-in", (req, res) => {
  res.render("general/log-in", {
    title: "Log-in page",
    values: {
      email: "",
      password: "",
    },
    messages: {},
  });
});

router.post("/log-in", (req, res) => {
  console.log(req.body);

  const { email, password, role } = req.body;
  let messages = {};
  let inValid = false;

  if (!email || email.trim().length === 0) {
    messages.email = "Email is required";
    inValid = true;
  }
  if (!password || password.trim().length === 0) {
    messages.password = "Password is required";
    inValid = true;
  }

  if (!role) {
    messages.role = "Please select a role";
    inValid = true;
  }

  if (inValid) {
    res.render("general/log-in", {
      title: "Log-in page",
      values: req.body,
      messages,
    });
  } else {
    userModel
      .findOne({
        email,
      })
      .then((user) => {
        if (user) {
          bcryptjs.compare(password, user.password).then((match) => {
            if (match) {
              req.session.user = user;
              req.session.role = role;
              console.log("User signed in");

              if (role === "dataEntryClerk") {
                res.redirect("/inventory/list");
              } else {
                res.redirect("/cart");
              }
            } else {
              messages.general =
                "Sorry, you entered an invalid email and/or password, please try again.";
              res.render("general/log-in", {
                title: "Log-in page",
                values: req.body,
                messages,
              });
            }
          });
        } else {
          messages.general =
            "Sorry, you entered an invalid email and/or password, please try again.";
          res.render("general/log-in", {
            title: "Log-in page",
            values: req.body,
            messages,
          });
        }
      })
      .catch((err) => {
        console.log("Unable to query the database: " + err);
        messages.general = "Sorry, could not log you in, please try again.";
        res.render("general/log-in", {
          title: "Log-in page",
          values: req.body,
          messages,
        });
      });
  }
});

router.post("/sign-up", (req, res) => {
  console.log(req.body);

  const { firstName, lastName, email, password } = req.body;
  let messages = {};
  let inValid = false;

  if (!firstName || firstName.trim().length === 0) {
    messages.firstName = "First Name is required";
    inValid = true;
  } else if (!/^[a-zA-Z]{2,}$/.test(firstName)) {
    messages.firstName =
      "First Name must contain only letters and be at least 2 characters long";
    inValid = true;
  }

  if (!lastName || lastName.trim().length === 0) {
    messages.lastName = "Last Name is required";
    inValid = true;
  } else if (!/^[a-zA-Z]{2,}$/.test(lastName)) {
    messages.lastName =
      "Last Name must contain only letters and be at least 2 characters long";
    inValid = true;
  }

  if (!email || email.trim().length === 0) {
    messages.email = "Email is required";
    inValid = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
    messages.email = "Invalid email format";
    inValid = true;
  }

  if (!password || password.trim().length === 0) {
    messages.password = "Password is required";
    inValid = true;
  } else if (!/^.{6,}$/.test(password)) {
    messages.password = "Password must be at least 6 characters long";
    inValid = true;
  }

  if (inValid) {
    res.render("general/sign-up", {
      title: "Sign-up page",
      values: req.body,
      messages,
    });
  } else {
    userModel.findOne({ email: email }).then((user) => {
      if (user) {
        messages.email = "Email already exists";
        res.render("general/sign-up", {
          title: "Sign-up page",
          values: req.body,
          messages,
        });
      } else {
        const newUser = new userModel({
          firstName,
          lastName,
          email,
          password,
        });

        newUser
          .save()
          .then(() => {
            console.log(`User ${firstName} has been added to the collection`);

            sendSimpleMessage(firstName, email)
              .then(() => {
                res.redirect(`/welcome?name=${encodeURIComponent(firstName)}`);
              })
              .catch(() => {
                res.redirect(`/welcome?name=${encodeURIComponent(firstName)}`);
              });
          })
          .catch((err) => {
            console.log(`Error occurred when saving user ... ${err}`);
            res.render("general/sign-up", {
              title: "Sign-up page",
              values: req.body,
              messages,
            });
          });
      }
    });
  }
});

async function sendSimpleMessage(firstName, email) {
  const FormData = require("form-data"); // form-data v4.0.1
  const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY,
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net/v3"
  });
  try {
    const data = await mg.messages.create(
      "sandboxfc373bb472894f42b5dccbc57a8c6a24.mailgun.org",
      {
        from: "Mailgun Sandbox <postmaster@sandboxfc373bb472894f42b5dccbc57a8c6a24.mailgun.org>",
        to: [`${firstName} <${email}>`],
        subject: `Welcome, ${firstName}!`,
        html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                <h2 style="color: #333;">Welcome to The Geek Zone, ${firstName}!</h2>
                <p style="font-size: 16px; color: #555;">We are excited to have you join our community!</p>
                <p style="font-size: 16px; color: #555;">Explore our collection of anime, gaming, and nerdy merchandise.</p>
  
                <p style="font-size: 16px; color: #555;">If you have any questions, feel free to contact us!</p>
                <p style="font-size: 16px; color: #555;">Best,<br>The Geek Zone Team</p>
              </div>
            `,
      }
    );

    console.log(data);
  } catch (error) {
    console.log("Error sending email:", error);
  }
}

router.get("/welcome", (req, res) => {
  const userName = req.query.name || "Shopper";
  res.render("general/welcome", { title: "Welcome Page", userName });
});

router.get("/cart", (req, res) => {
  if (!req.session.user || req.session.role !== "customer") {
    res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to view this page.",
    });
  } else {
    res.render("general/cart", {
      title: "Shopping-Cart",
      cart: req.session.cart || [],
    });
  }
});

router.get("/cart/add/:id", (req, res) => {
  if (!req.session.user || req.session.role !== "customer") {
    return res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to view this page.",
    });
  }

  const productId = req.params.id;

  let cart = (req.session.cart = req.session.cart || []);

  productModel
    .findOne({ _id: productId })
    .exec()
    .then((product) => {
      if (!product) {
        return res.render("general/error", {
          title: "Not Found",
          message: "Product not found.",
        });
      }

      let found = false;

      cart.forEach((item) => {
        if (item.product._id.toString() === productId) {
          item.qty += 1;
          found = true;
        }
      });

      if (!found) {
        cart.push({
          product: product.toObject(),
          qty: 1,
        });
      }

      cart.sort((a, b) => a.product.title.localeCompare(b.product.title));

      res.redirect("/cart");
    })
    .catch((err) => {
      console.error("DB error: " + err);
    });
});

router.post("/cart/update/:id", (req, res) => {
  if (!req.session.user || req.session.role !== "customer") {
    return res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to view this page.",
    });
  }

  const productId = req.params.id;
  const newQty = parseInt(req.body.qty);

  let cart = req.session.cart || [];

  const item = cart.find((item) => item.product._id == productId);
  if (item && newQty > 0) {
    item.qty = newQty;
  }

  res.redirect("/cart");
});

router.post("/cart/remove/:id", (req, res) => {
  if (!req.session.user || req.session.role !== "customer") {
    return res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to view this page.",
    });
  }

  const productId = req.params.id;
  const cart = req.session.cart || [];

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].product._id.toString() === productId) {
      cart.splice(i, 1); // Remove the item from the cart
      break;
    }
  }

  req.session.cart = cart;

  res.redirect("/cart");
});

router.get("/cart/checkout", (req, res) => {
  const user = req.session.user;
  const cart = req.session.cart || [];

  if (!user || req.session.role !== "customer") {
    return res.status(401).render("general/error", {
      title: "Unauthorized!!!",
      message: "You are not authorized to perform this action.",
    });
  }

  if (cart.length === 0) {
    return res.redirect("/cart");
  }

  let subtotal = 0;
  cart.forEach((item) => {
    const price =
      item.product.salePrice < item.product.price
        ? item.product.salePrice
        : item.product.price;
    subtotal += price * item.qty;
  });

  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  
  let messageBody = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Order Confirmation - The Geek Zone</h2>
      <p>Thank you for your purchase, ${user.firstName}!</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th align="left">Product</th>
            <th align="left">Price</th>
            <th align="left">Quantity</th>
            <th align="left">Total</th>
          </tr>
        </thead>
        <tbody>
  `;

  cart.forEach((item) => {
    const price =
      item.product.salePrice < item.product.price
        ? item.product.salePrice
        : item.product.price;
    const total = price * item.qty;
    messageBody += `
      <tr>
        <td>${item.product.title}</td>
        <td>$${price.toFixed(2)}</td>
        <td>${item.qty}</td>
        <td>$${total.toFixed(2)}</td>
      </tr>
    `;
  });

  messageBody += `
        </tbody>
      </table>
      <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
      <p><strong>Tax (10%):</strong> $${tax.toFixed(2)}</p>
      <p><strong>Grand Total:</strong> $${grandTotal.toFixed(2)}</p>

      <p>Cheers,<br>The Geek Zone Team</p>
    </div>
  `;

  sendOrderConfirmationEmail(user.firstName, user.email, messageBody)
    .then(() => {
      req.session.cart = []; 
      res.redirect("/cart"); 
    })
    .catch((err) => {
      console.log("Email error:", err);
      res.redirect("/cart");
    });
});

async function sendOrderConfirmationEmail(firstName, email, messageBody) {
  const FormData = require("form-data"); // form-data v4.0.1
  const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY,
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net/v3"
  });
  try {
    const data = await mg.messages.create(
      "sandboxfc373bb472894f42b5dccbc57a8c6a24.mailgun.org",
      {
        from: "Mailgun Sandbox <postmaster@sandboxfc373bb472894f42b5dccbc57a8c6a24.mailgun.org>",
        to: [`${firstName} <${email}>`],
        subject: `Order Confirmation - Thank you, ${firstName}!`,
        html: messageBody,
      }
    );

    console.log(data);
  } catch (error) {
    console.log("Error sending email:", error);
  }
}

router.get("/log-out", (req, res) => {
  req.session.destroy();
  res.redirect("/log-in");
});

module.exports = router;
