const cors = require("cors");
const express = require("express");
const stripe = require("stripe")("sk_test_WzkXhy9bPK7Wir3HZrpiqxB800AbVi94mG");
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.use(express.json());
app.use(cors());

app.get("/Wallet", (req, res) => {
    res.send("Add your Stripe Secret Key to the .require('stripe') statement!");
});

app.post("/Payment", async (req, res) => {
    console.log("Request:", req.body);

    let error;
    let status;
    try {
        const { token, price } = req.body;

        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        const idempotency_key = uuidv4();
        const charge = await stripe.charges.create({
            amount: price * 100,
            currency: "SGD",
            customer: customer.id,
            receipt_email: token.email,
            description: "E-Wallet Top-Up"
        }, {
            idempotency_key
        });
        console.log("Charge:", {
            charge
        });
        status = "success";
    } catch (error) {
        console.error("Error:", error);
        status = "failure";
    }

    res.json({
        error,
        status
    });
});

app.listen(8080);
