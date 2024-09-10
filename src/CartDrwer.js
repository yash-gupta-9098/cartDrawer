import React, { useState, useEffect } from 'react';

const CartDrawer = () => {
  const [cart, setCart] = useState(null);

  // Function to close the cart drawer
  const cartClose = () => {
    console.log("cart close");
    const evm_DrawerWrapper = document.querySelector("#evmcartdrawer");
    const webbody = document.querySelector("body");
    if (evm_DrawerWrapper) {
      evm_DrawerWrapper.classList.remove('active');
      webbody.classList.remove("js-drawer-open-right", "js-drawer-open", "ajax-cart__is-open", "js-drawer-open" , "ws_bodyactive" , "overflow-hidden");
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
          debouncedWsDrawerActive()        
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
    iconClickDrawerOpen();
    // Initial fetch of the cart data when the component mounts
    fetchCartData();
  }, []);

  return (
    <div id='evm-cart-drawer'>     
        <div id="evmcartdrawer-Overlay" className="evm-cart-drawer__overlay"onClick={cartClose}></div>
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





const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}; 



const wsDrawerActive  = () =>{
  console.log("darwer active")
  const evm_DrawerWrapper = document.querySelector("#evmcartdrawer");          
  const webbody = document.querySelector("body");
  if (evm_DrawerWrapper) {
    if (!evm_DrawerWrapper.classList.contains('active')) {
      // Add the 'active' class if not already present
      evm_DrawerWrapper.classList.add('active');
      webbody.classList.add('ws_bodyactive');
      // disabled default drawer 
      wsDsblAnthrCd();
    } else {
      console.log('The drawer already has the "active" class');
    }
  }

}

const debouncedWsDrawerActive = debounce(wsDrawerActive, 300); 



  


  
	const iconClickDrawerOpen  = () => {
    let $wsHdrSltr = 'body .wsCartOpen, body header .wsCartOpen, body header a[href="/cart"], body .header a[href="/cart"], body header a[href="/cart"] span, body header a[href="/cart"] svg';
	const $wsCartLinks = document.querySelectorAll($wsHdrSltr);
    $wsCartLinks.forEach(function($wsEle) {
		$wsEle.addEventListener('click', function(event) {
      console.log("iconclick")  
      wsDrawerActive()

    })
  })
}


const wsDsblAnthrCd = () => {
    let $wsDsblAnthrCd    = "#sidebar-cart, cart-notification, #monster-upsell-cart, cart-drawer, .section-cart-drawer, #modalAddToCartProduct, #modalAddToCartError, .cart__drawer, .tt-dropdown-menu, #halo-cart-sidebar, .drawer--cart, #Cart-Drawer, #cart-drawer, #CartDrawer, .quick-cart, .mfp-draw, #mini-cart, .site-header__drawers, .mini-cart, .js-slideout-overlay, .site-overlay, aside#cart, [data-atc-banner], #slideout-ajax-cart, .cart-preview, [data-section-type='availability-drawer'], #cart-dropdown, .cart-drawer, #kaktusc-app, #kaktusc-widget, #rebuy-cart, #added-to-cart, [class*='side-cart-position']";  
		document.body.classList.remove("js-drawer-open-right", "js-drawer-open", "ajax-cart__is-open", "js-drawer-open" , "overflow-hidden");
		const $selectorsArray = $wsDsblAnthrCd.split(',').map(selector => selector.trim());
		$selectorsArray.forEach(selector => {
			const $wsElmts = document.querySelectorAll(selector);
			$wsElmts.forEach($wsElmt => {
			/*$wsElmt.remove();*/
				$wsElmt.style.display = 'none';
			});
		});

}


export default CartDrawer;
