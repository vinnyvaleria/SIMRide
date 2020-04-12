const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(process.env.SECRET_KEY);
const uuid = require("uuid/v4");

const app = express();

app.use(express.json());
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:19006"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/", (req, res, next) => {
  res.send("Add your Stripe Secret Key to the .require('stripe') statement!");
});

app.post("/api/charge", async (req, res, next) => {
  console.log("Request:", req.body);

  let error;
  let status;
  try {
    const { product, token } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id
    });

    const idempotency_key = uuid();
    const charge = await stripe.charges.create(
      {
        amount: product.price * 100,
        currency: "SGD",
        customer: customer.id,
        receipt_email: token.email,
        description: product.description
      },
      {
        idempotency_key
      }
    );
    console.log("Charge:", { charge });
    status = "success";
  } catch (error) {
    console.error("Error:", error);
    status = "failure";
  }

  res.json({ error, status });
});

app.listen(19006);
