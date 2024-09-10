import React, { useState, useEffect, useRef } from 'react';

const CartDrwer = () => {
  const [cart, setCart] = useState(null);
  const prevCartItemsRef = useRef([]);

  const formdata = new FormData();
  formdata.append("store_address", "yash-demo-store-evm.myshopify.com");
  formdata.append("store_version", "2.0");

  useEffect(() => {
    const fetchCartDataNew = async () => {
      try {
        const response = await fetch('https://wiser.expertvillagemedia.com/cart_drawer_admin/getCartData?shop=yash-demo-store-evm.myshopify.com', {
          method: 'POST',
          body: formdata
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data, "data response");
        } else {
          console.error('Failed to fetch cart data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    // Fetch cart data when the component mounts
    fetchCartDataNew();
  }, []);

  const fetchCartData = async () => {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const cartData = await response.json();
      // Only set the cart if it's actually different
      if (JSON.stringify(cartData.items) !== JSON.stringify(prevCartItemsRef.current)) {
        setCart(cartData);
        prevCartItemsRef.current = cartData.items; // Update ref with new items
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  // Fetch initial cart data on mount
  useEffect(() => {
    fetchCartData();
  }, []);

  // Listen for changes in cart items and refetch only when there are real changes
  useEffect(() => {
    if (cart?.items) {
      const prevCartItems = prevCartItemsRef.current;

      const itemsHaveChanged = JSON.stringify(prevCartItems) !== JSON.stringify(cart.items);

      if (itemsHaveChanged) {
        console.log("Cart items have changed. Fetching updated data...");
        fetchCartData(); // Only fetch if items have changed
      }
    }
  }, [cart]);

  console.log(cart, "cart");

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
