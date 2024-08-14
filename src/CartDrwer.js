import React, { useState, useEffect, useRef } from 'react';

const CartDrwer = () => {
  const [cart, setCart] = useState(null);
 





   
  const formdata = new FormData();
  formdata.append("store_address", "yash-demo-store-evm.myshopify.com");
  formdata.append("store_version", "2.0");


 const  $wsDsblAnthrCd = "#sidebar-cart, cart-notification, #monster-upsell-cart, cart-drawer, .section-cart-drawer, #modalAddToCartProduct, #modalAddToCartError, .cart__drawer, .tt-dropdown-menu, #halo-cart-sidebar, .drawer--cart, #Cart-Drawer, #cart-drawer, #CartDrawer, .quick-cart, .mfp-draw, #mini-cart, .site-header__drawers, .mini-cart, .js-slideout-overlay, .site-overlay, aside#cart, [data-atc-banner], #slideout-ajax-cart, .cart-preview, [data-section-type='availability-drawer'], #cart-dropdown, .cart-drawer, #kaktusc-app, #kaktusc-widget, #rebuy-cart, #added-to-cart, [class*='side-cart-position']";
  useEffect(()=>{
  
    const fetchCartDataNew = async () => {
      try {
        const response = await fetch('https://wiser.expertvillagemedia.com/cart_drawer_admin/getCartData?shop=yash-demo-store-evm.myshopify.com', {
          method: 'POST',
          body: formdata
        });

          console.log( response  ,  "response from cart settings ")
        if (response.ok) {
          const data = await response.json();
          
        } else {
          console.error('Failed to fetch cart data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    // Fetch cart data if store address and theme version are available
    // if (storeAddress && wsThmVrsnVal) {
      fetchCartDataNew();
    // } 
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
 