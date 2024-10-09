import React, { useState, useEffect, useRef } from 'react';




const CartDrawer = () => {



  const [cart , setCart] = useState(null);
  const [wsCartSettings , setWsCartSettings] = useState(null);
  const [note, setNote] = useState(''); 
  const [discountCode, setDiscountCode] = useState(''); 
  const [cartOpen, setCartOpen] = useState(false);
  const [slTotalItemsLoading, setSlTotalItemsLoading] = useState({});
  const [slTotalLoading, setSlTotalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const tabContentRef = useRef(null);
  const handleTabClick = (id) => {
    setActiveTab(id); // Toggle tab
  };

  const handleNoteChange = (event) => {
    setNote(event.target.value); // Update the state as the user types
  }; 
  const handleClickOutside = (event) => {
    if (tabContentRef.current && !tabContentRef.current.contains(event.target)) {
      setActiveTab(null); // Hide tab content when clicked outside
    }
  };
  const closeTabcontent = () =>{
    setActiveTab(null);
  }


  


  


  useEffect(() => {
    // Function to handle clicks outside of the tab content
    const handleClickOutside = (event) => {
      if (tabContentRef.current && !tabContentRef.current.contains(event.target)) {
        closeTabcontent(); // Call the function to close the tab content
      }
    };

    // Add event listener to the document
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeTabcontent]);  


 
  // const quantityRef = useRef(null);
  // Function to close the cart drawer
  const cartClose = () => {
    setCartOpen(false);
    console.log("cart close");
    const evm_DrawerWrapper = document.querySelector("#evmcartdrawer");
    const webbody = document.querySelector("body");
    if (evm_DrawerWrapper) {
      evm_DrawerWrapper.classList.remove('active');
      webbody.classList.remove("js-drawer-open-right", "js-drawer-open", "ajax-cart__is-open", "js-drawer-open" , "ws_bodyactive" , "overflow-hidden");
    }
  };

  window.cartClose = cartClose;


  // Function to fetch cart data using Shopify's cart.js
  const fetchCartData = async () => {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error('Failed to fetch cart data');
      }
      const cartData = await response.json();
      console.log(cartData, "cartData");      
      setCart(prev => JSON.stringify(prev) !== JSON.stringify(cartData) ? cartData : prev);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    } 
  };



  useEffect(()=>{   
    if(cartOpen){
      debouncedWsDrawerActive() 
    }      
  },[cartOpen])




  // Intercept Shopify AJAX API calls for adding, updating, or removing items
  const interceptCartActions = () => { 
    // Intercept fetch calls
    const originalFetch = window.fetch; 
    window.fetch = async function(url, options) {
      const response = await originalFetch(url, options);

      console.log(url, "url");

      if (url.includes('cart/add') || url.includes('cart/change') || url.includes('cart/clear') || url.includes('cart/update.js')) {
        if (response.ok) {
          if(!url.includes('cart/change')){
            setCartOpen(true);
          }          
          console.log(`${url} API call was successful`);
          document.body.classList.remove("js-drawer-open-right", "js-drawer-open", "ajax-cart__is-open", "js-drawer-open" , "overflow-hidden");
            fetchCartData();
          // Fetch cart data after a successful add/update/remove API call
          
        }
      }
      return response;
    };
  };

  const increaseValue = (itemId) => {
    console.log(itemId , "itemId incre")
    const updatedCart = { ...cart };
    const item = updatedCart.items.find(item => item.id === itemId);
    if (item) {
      item.quantity += 1;
      setCart(updatedCart);
      updateCartQuantity(itemId, item.quantity); // Call the update cart API
    }
  };
  
  
  const decreaseValue = (itemId) => {
    console.log(itemId , "itemId decres")
    const updatedCart = { ...cart };
    const item = updatedCart.items.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      setCart(updatedCart);
      updateCartQuantity(itemId, item.quantity); // Call the update cart API
    }
  };
  
  // Function to update cart quantity via API
  const updateCartQuantity = async (itemId, quantity) => {
    console.log(itemId, quantity , "items" ,  "quentity" , "updateCartquentity");
    try {
      setSlTotalItemsLoading(prev => ({ ...prev, [itemId]: true }));
      setSlTotalLoading(true);
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `${itemId}`,
          quantity: quantity
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update cart quantity');
      }
      const cartData = await response.json();
      console.log(cartData , "cartData insiode  change  ")
      setCart(cartData);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }finally {
      setSlTotalItemsLoading(prev => ({ ...prev, [itemId]: false }));// Stop loading
      setSlTotalLoading(false);
    }
  };
   
  const updateCartNote = async () => {  
    
    try {
      const response = await fetch('/cart/update.js', { // Correct usage of fetch
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }), // Sending the note as JSON in the request body
      });
  
      // Check if the response was successful
      if (response.ok) {
        alert('Cart note updated successfully!'); // Handle success
        // setNote(''); // Reset the note input if the update was successful
      } else {
        console.log('Failed to update the cart note. Response status:', response.status);
      }
    } catch (err) {
      console.log('Failed to update the cart note. Error:', err); // Handle error
    } 
  };
  

  const applyDiscountCode = async (discountCode) => {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({         
          attributes: {
            discount_code: discountCode, // Adding the discount code
          },
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
        alert(`Discount code "${discountCode}" applied successfully!`);
        console.log('Updated Cart:', result); // Optionally log the updated cart details
      } else {
        console.log('Failed to apply the discount code. Response status:', response.status);
      }
    } catch (err) {
      console.log('Failed to apply the discount code. Error:', err);
    }
  };
  
  const handleCheckout = async () => {
    try { 
  
      if (cart.items.length > 0) {
        // Perform any additional validation or actions here
       console.log(discountCode , "discountCode");
       alert(window.location.href = discountCode ?  `/checkout?discount=${discountCode}`: '/checkout')
        window.location.href = discountCode ?  `/checkout?discount=${discountCode}`: '/checkout'; // Redirect to checkout
       
      } else {
        alert('Your cart is empty!');
      }
    } catch (err) {
      console.error('Error fetching cart data:', err);
    }
  };
  const handleViewCart = async () => {
    try {    
      if (cart.items.length > 0) {       
       
        window.location.href = "/cart"; // Redirect to checkout
       
      } else {
        alert('Your cart is empty!');
      }
    } catch (err) {
      console.error('Error fetching cart data:', err);
    }
  }; 


  const fetchCartSettingData = async () => {
    const wsUrl = `${$wsCdBaseUrl}cart_drawer_admin/getCartData?shop=${$storeAddress}`;

    const wsDataSend = new FormData();
    wsDataSend.append('store_address', $storeAddress);
    wsDataSend.append('store_version', $wsThmVrsnVal);

    try {
      const response = await fetch(wsUrl, {
        method: 'POST',
        body: {
          "store_address": window.Shopify.shop,
          "store_version" : "2.0"
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      setWsCartSettings(data); // Set the fetched data in the state
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }

  }


  useEffect(() => {
    // fetch cart settings  
    fetchCartSettingData();
    // Call the intercept function to start monitoring Shopify API calls
    interceptCartActions();
    iconClickDrawerOpen();
    // Initial fetch of the cart data when the component mounts
    fetchCartData();
    
    wsDsblAnthrCd();
  }, []);

  return (
    <div id='evm-cart-drawer'>     
        <div id="evmcartdrawer-Overlay" className="evm-cart-drawer__overlay" onClick={cartClose}></div>
        <div className="evm-cart-inner">

          <div className="ws-drawer-header">
              <div className="ws-dr-htop">
                  <div className='ws-dr-hcontent'>
                    <h3 className='ws-dr-heading'>Shopping Cart</h3>
                    <span class="ws-dr-count">{cart && cart?.item_count} items</span>
                  </div>
                  <button className='ws-dr-closebtn' onClick={cartClose}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 48 48" fill="none"> <path d="M10.5856 10.5862C10.9606 10.2112 11.4692 10.0006 11.9996 10.0006C12.5299 10.0006 13.0385 10.2112 13.4136 10.5862L23.9996 21.1722L34.5856 10.5862C34.7701 10.3951 34.9908 10.2428 35.2348 10.138C35.4788 10.0331 35.7412 9.97797 36.0068 9.97566C36.2723 9.97335 36.5357 10.024 36.7815 10.1245C37.0273 10.2251 37.2506 10.3736 37.4384 10.5614C37.6261 10.7492 37.7747 10.9725 37.8752 11.2183C37.9758 11.464 38.0264 11.7274 38.0241 11.993C38.0218 12.2585 37.9666 12.521 37.8618 12.765C37.757 13.009 37.6046 13.2297 37.4136 13.4142L26.8276 24.0002L37.4136 34.5862C37.7779 34.9634 37.9795 35.4686 37.9749 35.993C37.9704 36.5174 37.76 37.019 37.3892 37.3898C37.0184 37.7606 36.5168 37.971 35.9924 37.9755C35.468 37.9801 34.9628 37.7785 34.5856 37.4142L23.9996 26.8282L13.4136 37.4142C13.0364 37.7785 12.5312 37.9801 12.0068 37.9755C11.4824 37.971 10.9808 37.7606 10.6099 37.3898C10.2391 37.019 10.0288 36.5174 10.0242 35.993C10.0197 35.4686 10.2213 34.9634 10.5856 34.5862L21.1716 24.0002L10.5856 13.4142C10.2106 13.0391 10 12.5305 10 12.0002C10 11.4698 10.2106 10.9612 10.5856 10.5862Z" fill="#0D0D0D"/> </svg>
                  </button>
              </div>
          </div>

          {cart && cart.items.length > 0 && (
            <ul className='ws-dr-items'>
              {cart.items.map(item => (
                <li className="ws-dr-item"  key={item.id}>
                    <div className='ws-item-inner'>
                        <button className="ws-dtl-btn" onClick={()=> updateCartQuantity(item.id , 0)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" fill="none"> <path d="M14 8C14 6.93913 14.4214 5.92172 15.1716 5.17157C15.9217 4.42143 16.9391 4 18 4H30C31.0609 4 32.0783 4.42143 32.8284 5.17157C33.5786 5.92172 34 6.93913 34 8V12H42C42.5304 12 43.0391 12.2107 43.4142 12.5858C43.7893 12.9609 44 13.4696 44 14C44 14.5304 43.7893 15.0391 43.4142 15.4142C43.0391 15.7893 42.5304 16 42 16H39.862L38.128 40.284C38.0562 41.2932 37.6046 42.2376 36.8642 42.9271C36.1239 43.6167 35.1497 44 34.138 44H13.86C12.8483 44 11.8741 43.6167 11.1338 42.9271C10.3934 42.2376 9.94183 41.2932 9.87 40.284L8.14 16H6C5.46957 16 4.96086 15.7893 4.58579 15.4142C4.21071 15.0391 4 14.5304 4 14C4 13.4696 4.21071 12.9609 4.58579 12.5858C4.96086 12.2107 5.46957 12 6 12H14V8ZM18 12H30V8H18V12ZM12.148 16L13.862 40H34.14L35.854 16H12.148ZM20 20C20.5304 20 21.0391 20.2107 21.4142 20.5858C21.7893 20.9609 22 21.4696 22 22V34C22 34.5304 21.7893 35.0391 21.4142 35.4142C21.0391 35.7893 20.5304 36 20 36C19.4696 36 18.9609 35.7893 18.5858 35.4142C18.2107 35.0391 18 34.5304 18 34V22C18 21.4696 18.2107 20.9609 18.5858 20.5858C18.9609 20.2107 19.4696 20 20 20ZM28 20C28.5304 20 29.0391 20.2107 29.4142 20.5858C29.7893 20.9609 30 21.4696 30 22V34C30 34.5304 29.7893 35.0391 29.4142 35.4142C29.0391 35.7893 28.5304 36 28 36C27.4696 36 26.9609 35.7893 26.5858 35.4142C26.2107 35.0391 26 34.5304 26 34V22C26 21.4696 26.2107 20.9609 26.5858 20.5858C26.9609 20.2107 27.4696 20 28 20Z" fill="#0D0D0D"/> </svg>
                        </button>
                        <img className='ws-item-image' src={item.featured_image.url} alt={item.featured_image.alt} width={100} height={100}/>
                        <div className="ws-item-content">                             
                              <h4 className='ws-item-title'>{item.title}</h4>
                              <span className='ws-item-unit-price'>{item.presentment_price}</span>                              
                              <div className='ws-item-quantity-wrapper'>
                                  <button class="decrease" onClick={()=> decreaseValue(item.id)}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 48 48" fill="none"> <path d="M8 24C8 23.4696 8.21071 22.9609 8.58579 22.5858C8.96086 22.2107 9.46957 22 10 22H38C38.5304 22 39.0391 22.2107 39.4142 22.5858C39.7893 22.9609 40 23.4696 40 24C40 24.5304 39.7893 25.0391 39.4142 25.4142C39.0391 25.7893 38.5304 26 38 26H10C9.46957 26 8.96086 25.7893 8.58579 25.4142C8.21071 25.0391 8 24.5304 8 24Z" fill="#0D0D0D"/> </svg></button>
                                  <input type="number" readonly className="ws-item-quantity-count" name="quantity" max={item.quantity_rule?.max} min={item.quantity_rule?.min} value={item.quantity} />
                                  <button class="increase" onClick={()=>increaseValue(item.id)}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 48 48" fill="none"> <path d="M24 8C24.5304 8 25.0391 8.21071 25.4142 8.58579C25.7893 8.96086 26 9.46957 26 10V22H38C38.5304 22 39.0391 22.2107 39.4142 22.5858C39.7893 22.9609 40 23.4696 40 24C40 24.5304 39.7893 25.0391 39.4142 25.4142C39.0391 25.7893 38.5304 26 38 26H26V38C26 38.5304 25.7893 39.0391 25.4142 39.4142C25.0391 39.7893 24.5304 40 24 40C23.4696 40 22.9609 39.7893 22.5858 39.4142C22.2107 39.0391 22 38.5304 22 38V26H10C9.46957 26 8.96086 25.7893 8.58579 25.4142C8.21071 25.0391 8 24.5304 8 24C8 23.4696 8.21071 22.9609 8.58579 22.5858C8.96086 22.2107 9.46957 22 10 22H22V10C22 9.46957 22.2107 8.96086 22.5858 8.58579C22.9609 8.21071 23.4696 8 24 8Z" fill="#0D0D0D"/> </svg></button>
                              </div>
                              <div className='ws-item-variant-wrapper'>
                                <span className='ws-item-varinat-title'>{item.variant_title}</span>
                              </div>
                              <div className='ws-item-total-price-wrapper'>
                              {slTotalItemsLoading[item.id]  ? (
                                <span className='ws-loader'></span> // Display loader when loading
                              ) : (
                                <span className='ws-item-total-price'>
                                  {(Number(item.presentment_price) * Number(item.quantity)).toFixed(2)}
                                </span>
                              )}    
                              </div>                          
                        </div>
                    </div>                 
                  
                  </li>
              ))}
            </ul>
          )}

        {cart && cart.items.length == 0 && (
            <ul className='ws-dr-items ws-cart-empty'>
                  <div className='ws-ety-image'>
                    <svg id="icon-cart-emty" widht={50}height={50} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" ><path d="M263.4 103.4C269.7 97.18 279.8 97.18 286.1 103.4L320 137.4L353.9 103.4C360.2 97.18 370.3 97.18 376.6 103.4C382.8 109.7 382.8 119.8 376.6 126.1L342.6 160L376.6 193.9C382.8 200.2 382.8 210.3 376.6 216.6C370.3 222.8 360.2 222.8 353.9 216.6L320 182.6L286.1 216.6C279.8 222.8 269.7 222.8 263.4 216.6C257.2 210.3 257.2 200.2 263.4 193.9L297.4 160L263.4 126.1C257.2 119.8 257.2 109.7 263.4 103.4zM80 0C87.47 0 93.95 5.17 95.6 12.45L100 32H541.8C562.1 32 578.3 52.25 572.6 72.66L518.6 264.7C514.7 278.5 502.1 288 487.8 288H158.2L172.8 352H496C504.8 352 512 359.2 512 368C512 376.8 504.8 384 496 384H160C152.5 384 146.1 378.8 144.4 371.5L67.23 32H16C7.164 32 0 24.84 0 16C0 7.164 7.164 0 16 0H80zM107.3 64L150.1 256H487.8L541.8 64H107.3zM128 456C128 425.1 153.1 400 184 400C214.9 400 240 425.1 240 456C240 486.9 214.9 512 184 512C153.1 512 128 486.9 128 456zM184 480C197.3 480 208 469.3 208 456C208 442.7 197.3 432 184 432C170.7 432 160 442.7 160 456C160 469.3 170.7 480 184 480zM512 456C512 486.9 486.9 512 456 512C425.1 512 400 486.9 400 456C400 425.1 425.1 400 456 400C486.9 400 512 425.1 512 456zM456 432C442.7 432 432 442.7 432 456C432 469.3 442.7 480 456 480C469.3 480 480 469.3 480 456C480 442.7 469.3 432 456 432z" /></svg>
                  </div>
                  <p className="ws-emt-cart-content">Your cart is currently empty.</p>
                  <button className='ws-full-btn ws-continue-button'  disabled={slTotalLoading}>Continue shopping</button> 
            </ul>
          )}

        {cart && cart.items.length > 0 && (
          <div className="ws-drawer-footer">
                <div className="ws-dr-ftoplist">
                        <ul className='ws-dr-adi-items'>
                          <li className='ws-dr-adi-item' data-id="note" onClick={() => handleTabClick('note')}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" fill="none"> <path d="M18 23C18.5304 23 19.0391 22.7893 19.4142 22.4142C19.7893 22.0391 20 21.5304 20 21C20 20.4696 19.7893 19.9609 19.4142 19.5858C19.0391 19.2107 18.5304 19 18 19C17.4696 19 16.9609 19.2107 16.5858 19.5858C16.2107 19.9609 16 20.4696 16 21C16 21.5304 16.2107 22.0391 16.5858 22.4142C16.9609 22.7893 17.4696 23 18 23ZM22 21C22 20.4696 22.2107 19.9609 22.5858 19.5858C22.9609 19.2107 23.4696 19 24 19H30C30.5304 19 31.0391 19.2107 31.4142 19.5858C31.7893 19.9609 32 20.4696 32 21C32 21.5304 31.7893 22.0391 31.4142 22.4142C31.0391 22.7893 30.5304 23 30 23H24C23.4696 23 22.9609 22.7893 22.5858 22.4142C22.2107 22.0391 22 21.5304 22 21ZM24 25C23.4696 25 22.9609 25.2107 22.5858 25.5858C22.2107 25.9609 22 26.4696 22 27C22 27.5304 22.2107 28.0391 22.5858 28.4142C22.9609 28.7893 23.4696 29 24 29H30C30.5304 29 31.0391 28.7893 31.4142 28.4142C31.7893 28.0391 32 27.5304 32 27C32 26.4696 31.7893 25.9609 31.4142 25.5858C31.0391 25.2107 30.5304 25 30 25H24ZM24 31C23.4696 31 22.9609 31.2107 22.5858 31.5858C22.2107 31.9609 22 32.4696 22 33C22 33.5304 22.2107 34.0391 22.5858 34.4142C22.9609 34.7893 23.4696 35 24 35H30C30.5304 35 31.0391 34.7893 31.4142 34.4142C31.7893 34.0391 32 33.5304 32 33C32 32.4696 31.7893 31.9609 31.4142 31.5858C31.0391 31.2107 30.5304 31 30 31H24ZM20 27C20 27.5304 19.7893 28.0391 19.4142 28.4142C19.0391 28.7893 18.5304 29 18 29C17.4696 29 16.9609 28.7893 16.5858 28.4142C16.2107 28.0391 16 27.5304 16 27C16 26.4696 16.2107 25.9609 16.5858 25.5858C16.9609 25.2107 17.4696 25 18 25C18.5304 25 19.0391 25.2107 19.4142 25.5858C19.7893 25.9609 20 26.4696 20 27ZM18 35C18.5304 35 19.0391 34.7893 19.4142 34.4142C19.7893 34.0391 20 33.5304 20 33C20 32.4696 19.7893 31.9609 19.4142 31.5858C19.0391 31.2107 18.5304 31 18 31C17.4696 31 16.9609 31.2107 16.5858 31.5858C16.2107 31.9609 16 32.4696 16 33C16 33.5304 16.2107 34.0391 16.5858 34.4142C16.9609 34.7893 17.4696 35 18 35Z" fill="#0D0D0D"/> <path d="M18 4C17.4696 4 16.9609 4.21071 16.5858 4.58579C16.2107 4.96086 16 5.46957 16 6H12C10.9391 6 9.92172 6.42143 9.17157 7.17157C8.42143 7.92172 8 8.93913 8 10V40C8 41.0609 8.42143 42.0783 9.17157 42.8284C9.92172 43.5786 10.9391 44 12 44H36C37.0609 44 38.0783 43.5786 38.8284 42.8284C39.5786 42.0783 40 41.0609 40 40V10C40 8.93913 39.5786 7.92172 38.8284 7.17157C38.0783 6.42143 37.0609 6 36 6H32C32 5.46957 31.7893 4.96086 31.4142 4.58579C31.0391 4.21071 30.5304 4 30 4H18ZM32 10H36V40H12V10H16V12C16 12.5304 16.2107 13.0391 16.5858 13.4142C16.9609 13.7893 17.4696 14 18 14H30C30.5304 14 31.0391 13.7893 31.4142 13.4142C31.7893 13.0391 32 12.5304 32 12V10ZM20 10V8H28V10H20Z" fill="#0D0D0D"/> </svg><span className='ws-dr-adi-item-text'>Add Note</span></li>
                          <li style={{display: "none"}} className='ws-dr-adi-item' data-id="gift"  onClick={() => handleTabClick('gift')} ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"> <path d="M 12 5 C 10.355469 5 9 6.355469 9 8 C 9 8.351563 9.074219 8.683594 9.1875 9 L 4 9 L 4 15 L 5 15 L 5 28 L 27 28 L 27 15 L 28 15 L 28 9 L 22.8125 9 C 22.925781 8.683594 23 8.351563 23 8 C 23 6.355469 21.644531 5 20 5 C 18.25 5 17.0625 6.328125 16.28125 7.4375 C 16.175781 7.585938 16.09375 7.730469 16 7.875 C 15.90625 7.730469 15.824219 7.585938 15.71875 7.4375 C 14.9375 6.328125 13.75 5 12 5 Z M 12 7 C 12.625 7 13.4375 7.671875 14.0625 8.5625 C 14.214844 8.78125 14.191406 8.792969 14.3125 9 L 12 9 C 11.433594 9 11 8.566406 11 8 C 11 7.433594 11.433594 7 12 7 Z M 20 7 C 20.566406 7 21 7.433594 21 8 C 21 8.566406 20.566406 9 20 9 L 17.6875 9 C 17.808594 8.792969 17.785156 8.78125 17.9375 8.5625 C 18.5625 7.671875 19.375 7 20 7 Z M 6 11 L 26 11 L 26 13 L 17 13 L 17 12 L 15 12 L 15 13 L 6 13 Z M 7 15 L 25 15 L 25 26 L 17 26 L 17 16 L 15 16 L 15 26 L 7 26 Z" /> </svg></li>
                          <li style={{display: "none"}} className='ws-dr-adi-item' data-id="shippingrates" onClick={() => handleTabClick('shippingrates')}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"> <path d="M 1 4 L 1 25 L 4.15625 25 C 4.601563 26.71875 6.148438 28 8 28 C 9.851563 28 11.398438 26.71875 11.84375 25 L 20.15625 25 C 20.601563 26.71875 22.148438 28 24 28 C 25.851563 28 27.398438 26.71875 27.84375 25 L 31 25 L 31 14.59375 L 30.71875 14.28125 L 24.71875 8.28125 L 24.40625 8 L 19 8 L 19 4 Z M 3 6 L 17 6 L 17 23 L 11.84375 23 C 11.398438 21.28125 9.851563 20 8 20 C 6.148438 20 4.601563 21.28125 4.15625 23 L 3 23 Z M 19 10 L 23.5625 10 L 29 15.4375 L 29 23 L 27.84375 23 C 27.398438 21.28125 25.851563 20 24 20 C 22.148438 20 20.601563 21.28125 20.15625 23 L 19 23 Z M 8 22 C 9.117188 22 10 22.882813 10 24 C 10 25.117188 9.117188 26 8 26 C 6.882813 26 6 25.117188 6 24 C 6 22.882813 6.882813 22 8 22 Z M 24 22 C 25.117188 22 26 22.882813 26 24 C 26 25.117188 25.117188 26 24 26 C 22.882813 26 22 25.117188 22 24 C 22 22.882813 22.882813 22 24 22 Z" /> </svg></li>
                          <li className='ws-dr-adi-item' data-id="discount" onClick={() => handleTabClick('discount')} ><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" fill="none"> <path d="M4 6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H22C22.5304 4.00011 23.039 4.2109 23.414 4.586L43.414 24.586C43.7889 24.9611 43.9996 25.4697 43.9996 26C43.9996 26.5303 43.7889 27.0389 43.414 27.414L27.414 43.414C27.0389 43.7889 26.5303 43.9996 26 43.9996C25.4697 43.9996 24.9611 43.7889 24.586 43.414L4.586 23.414C4.2109 23.039 4.00011 22.5304 4 22V6ZM8 8V21.172L26 39.172L39.172 26L21.172 8H8Z" fill="#0D0D0D"/> <path d="M18 15C18 15.7956 17.6839 16.5587 17.1213 17.1213C16.5587 17.6839 15.7956 18 15 18C14.2044 18 13.4413 17.6839 12.8787 17.1213C12.3161 16.5587 12 15.7956 12 15C12 14.2044 12.3161 13.4413 12.8787 12.8787C13.4413 12.3161 14.2044 12 15 12C15.7956 12 16.5587 12.3161 17.1213 12.8787C17.6839 13.4413 18 14.2044 18 15Z" fill="#0D0D0D"/> </svg> <span className='ws-dr-adi-item-text'>Add Coupon</span></li>
                        </ul>
                </div>
                <div className="ws-dr-cartfooter">                  
                    <div className='ws-dr-fcontent'>
                    {cart?.total_discount > 0 && ( 
                        <>
                          <h3 className='ws-dr-heading ws-dr-fheading'>Discounts</h3>
                          {slTotalLoading ? (
                            <span className='ws-loader'></span> // Display loader when loading
                          ) : (
                            <span className="ws-dr-fcartTotal">
                              {Number(cart?.total_discount / 100).toFixed(2)}
                            </span>
                          )}
                        </>
                      )}                      
                      <h3 className='ws-dr-heading ws-dr-fheading'>Subtotal</h3>
                      {slTotalLoading  ? (
                                  <span className='ws-loader'></span> // Display loader when loading
                                ) : (
                          <span class="ws-dr-fcartTotal">{Number(cart?.total_price/100).toFixed(2)}</span>
                      )} 
                    </div>                    
                    <p class="ws-shipping-text">Shipping & taxes calculated at checkout</p>
                    <div className='ws-dr-fbottons'>
                      <button className='ws-full-btn ws-viewcart-button'  disabled={slTotalLoading} onClick={()=>handleViewCart()}>View Cart</button>  
                      <button className='ws-full-btn ws-checkoutcart-button'  disabled={slTotalLoading} onClick={()=>handleCheckout()} >Checkout</button>  
                    </div>   
                    <div className='ws-dr-fpaymentIcons'>
                        <img className='ws-dr-ficonsImg' width="100%" height="40px" src="https://qikify-cdn.nyc3.digitaloceanspaces.com/production/stickycart/instances/7049/41eb2ff46847eaaa130ff58d84e274be60d8f538cb659883b419bdb4cd9aa1f8.png" alt="payment-alt" />
                    </div>       
                </div>
            </div>

           )}

             <div className={`ws-tab-content ${activeTab ? "active" : ""}  `} ref={tabContentRef}>
              {activeTab === 'note' && <CartNote closeTabcontent={closeTabcontent} note={note} handleNoteChange={handleNoteChange} updateCartNote={updateCartNote}/>}
              {activeTab === 'gift' && <div><GiftWrapper closeTabcontent={closeTabcontent} /></div>}
              {activeTab === 'shippingrates' && <ShippingPrice closeTabcontent={closeTabcontent}/>}
              {activeTab === 'discount' && <DiscountCoupon closeTabcontent={closeTabcontent} applyDiscountCode={applyDiscountCode} setDiscountCode={setDiscountCode} discountCode={discountCode}/>}
            </div>           

        </div>

        
         
     
    </div>
  );
};


export const GiftWrapper =({closeTabcontent}) => {
  
  return  (
    <div className='ws-gift'> 
        <div className='ws-gift-top'>
          <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="25px" height="25px" viewBox="0 0 64 64" enableBackground="new 0 0 64 64" xmlSpace="preserve"> <rect x={1} y={18} fill="none" stroke="#000000" strokeWidth={2} strokeMiterlimit={10} width={62} height={9} /> <rect x={6} y={27} fill="none" stroke="#000000" strokeWidth={2} strokeMiterlimit={10} width={52} height={31} /> <line fill="none" stroke="#000000" strokeWidth={2} strokeMiterlimit={10} x1={32} y1={58} x2={32} y2={18} /> <path fill="none" stroke="#000000" strokeWidth={2} strokeMiterlimit={10} d="M32,18c0,0-13,0.101-13-9c0-7,13-4.068,13,2 C32,17.067,32,18,32,18z" /> <path fill="none" stroke="#000000" strokeWidth={2} strokeMiterlimit={10} d="M32,18c0,0,13,0.101,13-9c0-7-13-4.068-13,2 C32,17.067,32,18,32,18z" /></svg>
          <span className='ws-gift-content'>Do you want a gift wrap?</span>
        </div>
        <div className='ws-save-buttons'>
            <button className='ws-full-btn ws-gift-button' >Add A Gift Wrap</button>  
            <button className='ws-full-btn ws-cancel-button' onClick={()=> closeTabcontent()} >Cancel</button>  
        </div>  
    </div>
  )
}



export const CartNote = ({closeTabcontent , handleNoteChange , updateCartNote , note}) => {
  return(
    <div className='ws-cart-note'>
      <span className='ws-content-heading'>Edit Order Note </span>
      <textarea className='ws-cart-message' placeholder='How can we help you?' onChange={(e)=> handleNoteChange(e)}>{note != "" ? note : null}</textarea>
      <div className='ws-save-buttons'>
          <button className='ws-full-btn ws-save-button' onClick={()=>updateCartNote()}>Save</button>  
          <button className='ws-full-btn ws-cancel-button' onClick={()=> closeTabcontent()} >Cancel</button>        
      </div>  
    </div>
    
  )

}  

export const ShippingPrice= ({closeTabcontent})=>{
  return(
    <div className='ws-shipping-price'>
      <span className='ws-content-heading'>Estimate shipping</span>
      <div className='ws-field'>
        <label htmlFor='wsCountryList'>Country</label>      
        <select type="" className='ws-countryList' id="wsCountryList"></select>
      </div>
      <div className='ws-field'>
        <label htmlFor='wsProvince'>Country</label>      
        <select type="" className='ws-Province' id="wsProvince"></select>
      </div>      
      <div className='ws-field'>
        <label htmlFor='wszipcode'>Country</label>      
        <input className='ws-zipcode' id="wszipcode" type=''></input>
      </div>    
      <div className='ws-save-buttons'>
          <button className='ws-full-btn ws-save-button' >Save</button>  
          <button className='ws-full-btn ws-cancel-button' onClick={()=> closeTabcontent()} >Cancel</button>        
      </div>  
    </div>
    
  )
}


export const DiscountCoupon = ({closeTabcontent , discountCode , applyDiscountCode , setDiscountCode}) => {
  return(
    <div className='ws-cart-note'>
      <span className='ws-content-heading'>Add A Coupon</span>
      <span className='ws-discount-content'>Coupon code will work on checkout page</span>         
      <input className='ws-discount-code' id="wsdiscountcode" type='text' placeholder='Coupon code' value={discountCode != "" ? discountCode : null} onChange={(event)=> setDiscountCode(event.target.value)}></input>   
      <div className='ws-save-buttons'>
          <button className='ws-full-btn ws-save-button' onClick={()=> applyDiscountCode(discountCode)}>Save</button>  
          <button className='ws-full-btn ws-cancel-button' onClick={()=> closeTabcontent()} >Cancel</button>        
      </div>  
    </div>
    
  )

}  


const debounce = (func, delay) => {
  let timeoutId;
  return (... args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}; 



const wsDrawerActive  = async() =>{
  
  console.log("darwer active")
  const evm_DrawerWrapper = document.querySelector("#evmcartdrawer");          
  const webbody = document.querySelector("body");
  if (evm_DrawerWrapper) {
    if (!evm_DrawerWrapper.classList.contains('active')) {
      // Add the 'active' class if not already present
      evm_DrawerWrapper.classList.add('active');      
      // disabled default drawer 
      webbody.classList.add('ws_bodyactive');
      
    } else {
      console.log('The drawer already has the "active" class');
    }
  }

}

window.wsDrawerActive = wsDrawerActive;

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