const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

// Replace with your actual Razorpay keys (use test keys first!)
const razorpay = new Razorpay({
  key_id: 'rzp_test_YourKeyIdHere',     // e.g., rzp_test_abc123
  key_secret: 'YourKeySecretHere'       // Keep this secret!
});

app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body; // amount in paise
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });
    res.json({ order_id: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Order creation failed' });
  }
});

app.post('/verify-payment', (req, res) => {
  const { order_id, payment_id, signature } = req.body;
  const expectedSignature = crypto
    .createHmac('sha256', 'YourKeySecretHere') // Same secret as above
    .update(`${order_id}|${payment_id}`)
    .update('hex');

  if (expectedSignature === signature) {
    // Payment is genuine - you can save to DB here later
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
