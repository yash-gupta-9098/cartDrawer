import React, { useState, useEffect } from 'react';

const CartDrawer = () => {
  const [cart, setCart] = useState(null);
  const [cartsett, setCartSett] = useState(null);

  const formdata = new FormData();
  formdata.append("store_address", "yash-demo-store-evm.myshopify.com");
  formdata.append("store_version", "2.0");

  // Fetch external cart data
  const fetchCartDataNew = async () => {
    try {
      const response = await fetch('https://wiser.expertvillagemedia.com/cart_drawer_admin/getCartData?shop=yash-demo-store-evm.myshopify.com', {
        method: 'POST',
        body: formdata
      });

      if (response.ok) {
        const data = await response.json();
        setCartSett(data);
      } else {
        console.error('Failed to fetch external cart data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Fetch local cart data (Shopify's cart.js)
  const fetchCartData = async () => {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const cartData = await response.json();
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  useEffect(() => {
    // Initial fetch for cart data from both sources
    fetchCartData();
    fetchCartDataNew();

    // Set up a listener to detect cart updates
    document.addEventListener('cart:updated', fetchCartData);

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('cart:updated', fetchCartData);
    };
  }, []);

  // Example of dispatching the custom event after cart changes
  const simulateCartUpdate = () => {
    // This is an example of simulating a cart update
    const event = new Event('cart:updated');
    document.dispatchEvent(event);
  };

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
      <button onClick={simulateCartUpdate}>Simulate Cart Update</button>
    </div>
  );
};

export default CartDrawer;
