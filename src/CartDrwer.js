import React, { useEffect, useState } from 'react'

function CartDrwer() {
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
    
        // Call the fetch function
        fetchCartData();
        console.log(cart , "cart");
      }, [cart?.item_count]);

  return (
    <div className='ws_cart_drawer'>
        <div className='ws_header-top'>
                <h2 className='ws_cart_heading'>Your cart</h2>

            
        
        </div>
    </div>
  )
}

export default CartDrwer