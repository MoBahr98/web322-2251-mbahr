/*************************************************************************************
 * WEB322 - 2251 Project
 * I declare that this assignment is my own work in accordance with the Seneca Academic
 * Policy. No part of this assignment has been copied manually or electronically from
 * any other source (including web sites) or distributed to other students.
 *
 * Student Name  : Mohamed Bahr
 * Student ID    : 148056237
 * Student Email : mbahr@myseneca.ca
 * Course/Section: WEB322/NFF
 *
 **************************************************************************************/

const path = require("path");
const express = require("express");
const app = express();
app.use(express.static(path.join(__dirname, "/assets")));
const productUtil = require("./modules/product-util");

const expressLayouts = require("express-ejs-layouts");


const dotenv = require("dotenv");
dotenv.config({path: "./config/.env"});

app.set("view engine", "ejs");
app.set("layout", "layouts/main");
app.use(expressLayouts);
app.set('views', __dirname + '/views'); //for vercel

// Add middleware to parse the POST data of the body
app.use(express.urlencoded({ extended: false }));

// Add your routes here
// e.g. app.get() { ... }

app.get("/", (req, res) => {
  res.render("home", {
    title: "Home - Geek Zone",
    products: productUtil.getFeaturedProducts(),
  });
});

app.get("/inventory", (req, res) => {
  res.render("inventory", {
    title: "Inventory",
    products: productUtil.getProductsByCategory(productUtil.getAllProducts()),
  });
});

app.get("/sign-up", (req, res) => {
  res.render("sign-up", {
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

app.get("/log-in", (req, res) => {
  res.render("log-in", {
    title: "Log-in page",
    values: {
      email: "",
      password: "",
    },
    messages: {},
  });
});

app.post("/log-in", (req, res) => {
  console.log(req.body);

  const { email, password } = req.body;
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

  if (inValid) {
    res.render("log-in", { title: "Log-in page", values: req.body, messages });
  } else {
    res.redirect("/");
  }
});

app.post("/sign-up", (req, res) => {
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
    res.render("sign-up", {
      title: "Sign-up page",
      values: req.body,
      messages,
    });
  } else {
    const FormData = require("form-data"); // form-data v4.0.1
    const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0

    async function sendSimpleMessage() {
      const mailgun = new Mailgun(FormData);
      const mg = mailgun.client({
        username: "api",
        key: process.env.API_KEY,
        // When you have an EU-domain, you must specify the endpoint:
        // url: "https://api.eu.mailgun.net/v3"
      });
      try {
        const data = await mg.messages.create(
          "sandboxb00d8773929b4431986a100a17d6fe13.mailgun.org",
          {
            from: "Mailgun Sandbox <postmaster@sandboxb00d8773929b4431986a100a17d6fe13.mailgun.org>",
            to: [`${firstName} <${email}>`],
            subject: `Welcome, ${firstName}!`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
              <h2 style="color: #333;">Welcome to The Geek Zone, ${firstName}!</h2>
              <p style="font-size: 16px; color: #555;">We are excited to have you join our community!</p>
              <p style="font-size: 16px; color: #555;">Explore our collection of anime, gaming, and nerdy merchandise.</p>

              <p style="font-size: 14px; color: #888;">If you have any questions, feel free to contact us!</p>
              <p style="font-size: 14px; color: #888;">Best,<br>The Geek Zone Team</p>
            </div>
          `,
          }
        );

        console.log(data); // logs response data
        res.redirect(`/welcome?name=${encodeURIComponent(req.body.firstName)}`);
      } catch (error) {
        console.log(error); //logs any error
        res.render("sign-up", {
          title: "Sign-up page",
          values: req.body,
          messages,
        });
      }
    }
    sendSimpleMessage();
  }
});

app.get("/welcome", (req, res) => {
  const userName = req.query.name || "Shopper";
  res.render("welcome", { title: "Welcome Page", userName });
});

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// *** DO NOT MODIFY THE LINES BELOW ***

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);
