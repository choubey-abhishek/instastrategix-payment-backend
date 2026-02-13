document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const totalSpan = document.getElementById('total-amount');
  const payBtn = document.getElementById('pay-btn');
  const loading = document.getElementById('loading');
  let total = 0;

  // Update total
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      total = Array.from(checkboxes)
        .filter(c => c.checked)
        .reduce((sum, c) => sum + parseInt(c.dataset.price), 0);
      
      totalSpan.textContent = total.toLocaleString('en-IN');
      payBtn.disabled = total === 0;
    });
  });

  // Pay button
  payBtn.addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name || !email || !phone || total === 0) {
      alert('Please fill all details and select at least one service.');
      return;
    }

    payBtn.disabled = true;
    loading.style.display = 'block';

    try {
      // Create order
      const orderRes = await fetch('https://your-backend-url.onrender.com/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total * 100 })
      });

      if (!orderRes.ok) throw new Error('Failed to create order');

      const orderData = await orderRes.json();

      // Razorpay options
      const options = {
        key: 'YOUR_RAZORPAY_TEST_KEY',
        amount: total * 100,
        currency: 'INR',
        name: 'Instastrategix',
        description: 'Digital Marketing Services',
        order_id: orderData.order_id,
        handler: async (response) => {
          // Verify
          const verifyRes = await fetch('https://your-backend-url.onrender.com/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            window.location.href = 'success.html';
          } else {
            alert('Payment failed. Please try again.');
            window.location.href = 'failed.html';
          }
        },
        prefill: { name, email, contact: phone },
        theme: { color: '#3399cc' },
        modal: { ondismiss: () => { payBtn.disabled = false; loading.style.display = 'none'; } }
      };

      const rzp = new Razorpay(options);
      rzp.open();

    } catch (err) {
      alert('Payment initiation failed. Please try again.');
      payBtn.disabled = false;
      loading.style.display = 'none';
    }
  });
});
