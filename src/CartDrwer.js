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
      console.log(cartData, "cartData");
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  // Intercept Shopify AJAX API calls for adding, updating, or removing items
  const interceptCartActions = () => {
    // Intercept /add.js API call
    const originalFetch = window.fetch;
    window.fetch = async function(url, options) {
      const response = await originalFetch(url, options);

      if (
        url.includes('cart/add.js') ||
        url.includes('cart/update.js') ||
        url.includes('cart/change.js') ||
        url.includes('cart/clear.js')
      ) {
        console.log(`${url} API call was successful`);
        if (response.ok) {
          fetchCartData(); // Fetch cart data after a successful add/update/remove API call
        }
      }
      return response;
    };
  };

  useEffect(() => {
    // Call the intercept function to start monitoring Shopify API calls
    interceptCartActions();

    // Listen for Shopify's cart:updated event
    document.addEventListener('cart:updated', fetchCartData);

    // Initial fetch of the cart data when the component mounts
    fetchCartData();

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('cart:updated', fetchCartData);
    };
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
