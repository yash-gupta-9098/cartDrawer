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
  const interceptCartActions = (evm_DrawerWrapper) => {
    // Intercept /add.js API call
    const originalAddToCart = window.fetch;
    window.fetch = async function(url, options) {
      const response = await originalAddToCart(url, options);
console.log(url , "url");
      if (url.includes('cart/add') || url.includes('cart/update.js') || url.includes('cart/change') || url.includes('cart/clear') ) {        
        if (response.ok) {
          if (!evm_DrawerWrapper.classList.contains('active')) {
            // If it doesn't, add the 'active' class
            evm_DrawerWrapper.classList.add('active');
          } else {
            console.log('The drawer already has the "active" class');
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
    const evm_DrawerWrapper = document.querySelector("#evmcartdrawer"); 
    // Call the intercept function to start monitoring Shopify API calls
    interceptCartActions(evm_DrawerWrapper);
    // Initial fetch of the cart data when the component mounts
    fetchCartData();

  }, []);

  return (
    <div id='evm-cart-drawer'>  
        <div id="evmcartdrawer-Overlay" class="evm-cart-drawer__overlay"></div>   
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
  );
};

export default CartDrawer;
