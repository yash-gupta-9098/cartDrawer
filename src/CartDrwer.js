import React, { useState, useEffect, useRef } from 'react';

const CartDrwer = () => {
  const [cart, setCart] = useState(null);
  const [cartSett, setCartSett] = useState(null);
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
          setCartSett(data);
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
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    };

    // Fetch initial cart data
    fetchCartData();

    // Update previous cart items reference when the cart changes
    if (cart?.items) {
      prevCartItemsRef.current = cart.items;
    }

    // Poll for cart changes every 5 seconds (optional)
    // const intervalId = setInterval(fetchCartData, 5000);

    // Cleanup interval on component unmount
    // return () => clearInterval(intervalId);
  }, [cart?.items]);

  // Check if the cart items have changed
  useEffect(() => {
    if (cart?.items) {
      const prevCartItems = prevCartItemsRef.current;

      // Compare previous and current cart items
      const itemsHaveChanged = JSON.stringify(prevCartItems) !== JSON.stringify(cart.items);

      if (itemsHaveChanged) {
        console.log("Cart items have changed. Fetching updated data...");
        // Fetch the cart data again if the items have changed
        fetch('/cart.js')
          .then(response => response.json())
          .then(data => setCart(data))
          .catch(error => console.error('Error fetching updated cart data:', error));

        // Update the previous cart items reference
        prevCartItemsRef.current = cart.items;
      }
    }
  }, [cart?.items]);

  console.log(cartSett, "cartSett");
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
