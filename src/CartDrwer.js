import React, { useState, useEffect } from 'react';

const CartDrawer = () => {
  const [cart, setCart] = useState(null);

  // Function to close the cart drawer
  const cartClose = () => {
    const evm_DrawerWrapper = document.querySelector("#evmcartdrawer");
    const webbody = document.querySelector("body");
    if (evm_DrawerWrapper) {
      evm_DrawerWrapper.classList.remove('active');
      webbody.classList.remove('ws_bodyactive');
    }
  };

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
    // Intercept fetch calls
    const originalFetch = window.fetch;
    window.fetch = async function(url, options) {
      const response = await originalFetch(url, options);

      console.log(url, "url");

      if (url.includes('cart/add') || url.includes('cart/update.js') || url.includes('cart/change') || url.includes('cart/clear')) {
        if (response.ok) {
          const evm_DrawerWrapper = document.querySelector("#evmcartdrawer");
          const webbody = document.querySelector("body");
          if (evm_DrawerWrapper) {
            if (!evm_DrawerWrapper.classList.contains('active')) {
              // Add the 'active' class if not already present
              evm_DrawerWrapper.classList.add('active');
              webbody.classList.add('ws_bodyactive');
            } else {
              console.log('The drawer already has the "active" class');
            }
          }
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
    <div id='evm-cart-drawer'>
      <div
        id="evmcartdrawer"
        className="evm-cart-drawer__wrapper"
      >
        <div
          id="evmcartdrawer-Overlay"
          className="evm-cart-drawer__overlay"
          onClick={cartClose}
        ></div>
        <div className="evm-cart-inner">
          {cart && (
            <ul>
              {cart.items.map(item => (
                <li key={item.id}>{item.title} - {item.quantity}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
