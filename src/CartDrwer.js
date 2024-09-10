import React, { useState, useEffect } from 'react';

const CartDrawer = () => {
  const [cart, setCart] = useState(null);

  // Function to fetch cart data using Shopify's cart.js
  const fetchCartData = async () => {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error('Failed to fetch cart data');
      }
      const cartData = await response.json();
      console.log(cartData , "cartData");
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  // Intercept Shopify AJAX API calls for adding, updating, or removing items
  const interceptCartActions = () => {
    // Intercept /add.js API call
    const originalAddToCart = window.fetch;
    window.fetch = async function(url, options) {
      const response = await originalAddToCart(url, options);

      if (url.includes('/add.js') || url.includes('/update.js') || url.includes('/change.js')) {
        if (response.ok) {
          console.log(`${url} API call was successful`);
          // Fetch cart data after a successful add/update/remove API call
          fetchCartData();
        }
      }
      return response;
    };
  };

  useEffect(() => {
    // Call the intercept function to start monitoring Shopify API calls
    interceptCartActions();
    // Initial fetch of the cart data when the component mounts
    fetchCartData();

  }, []);

  return (
    <div>
      {/* Render the cart data */}
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

export default CartDrawer;
