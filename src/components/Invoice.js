import React from 'react';

// ForwardRef ka use zaroori hai taaki printing library ise access kar sakay
export const Invoice = React.forwardRef((props, ref) => {
  const { cartItems, totalAmount, orderId } = props;

  return (
    <div ref={ref} style={{ padding: '20px', width: '80mm', fontFamily: 'Arial' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>MERA STORE</h2>
        <p>Order ID: #{orderId}</p>
        <p>{new Date().toLocaleString()}</p>
      </div>
      <hr />
      <table style={{ width: '100%', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th align="left">Item</th>
            <th align="center">Qty</th>
            <th align="right">Price</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td align="center">{item.quantity}</td>
              <td align="right">Rs. {item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
        Total: Rs. {totalAmount}
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
        <p>Thank you for shopping!</p>
      </div>
    </div>
  );
});