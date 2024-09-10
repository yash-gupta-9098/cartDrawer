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
    // Intercept window.fetch API
    const originalFetch = window.fetch;
    window.fetch = async function(url, options) {
      const response = await originalFetch(url, options);

      // Check if the API call is for Shopify's cart actions
      if (
        url.includes('cart/add.js') ||
        url.includes('cart/update.js') ||
        url.includes('cart/change.js') ||
        url.includes('cart/clear.js')
      ) {
        console.log(`${url} API call was successful`);
        if (response.ok) {
          fetchCartData(); // Fetch cart data after a successful cart-related API call
        }
      }

      return response;
    };

    // Optional: Also intercept XMLHttpRequest if Shopify uses it instead of fetch
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {
      this.addEventListener('load', function() {
        if (
          url.includes('cart/add.js') ||
          url.includes('cart/update.js') ||
          url.includes('cart/change.js') ||
          url.includes('cart/clear.js')
        ) {
          console.log(`${url} API call was successful via XMLHttpRequest`);
          fetchCartData(); // Fetch cart data after a successful cart-related API call
        }
      });
      return originalXHR.apply(this, arguments);
    };
  };

  useEffect(() => {
    // Intercept cart actions when the component mounts
    interceptCartActions();

    // Fetch the initial cart data when the component mounts
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
