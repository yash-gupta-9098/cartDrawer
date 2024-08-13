import React, { useState, useEffect } from 'react';

const CartDrwer = () => {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    // Function to fetch the cart data
    const fetchCartData = async () => {
      try {
        const response = await fetch('/cart.js');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const cartData = await response.json();
        setCart(cartData);
        console.log(cartData);
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    };

    // Fetch initial cart data
    fetchCartData();

    // Set up a polling interval to fetch cart data every 5 seconds
    const intervalId = setInterval(fetchCartData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {/* Render your cart data here */}
      {cart && (
        <ul>
          {cart.items.map(item => (
            <li key={item.id}>{item.title} - {item.quantity}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CartDrwer;
 