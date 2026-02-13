const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());  // Allow your GitHub Pages domain

const rzp = new Razorpay({
  key_id: 'YOUR_KEY_ID',
  key_secret: 'YOUR_KEY_SECRET'
});

app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await rzp.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: 'receipt_' + Date.now()
    });
    res.json({ order_id: order.id });
  } catch (err) {
    res.status(500).json({ error: 'Order creation failed' });
  }
});

app.post('/verify-payment', (req, res) => {
  const { order_id, payment_id, signature } = req.body;
  const expectedSignature = crypto.createHmac('sha256', 'YOUR_KEY_SECRET')
    .update(order_id + '|' + payment_id)
    .digest('hex');

  if (expectedSignature === signature) {
    // Payment valid - save to DB here later
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
