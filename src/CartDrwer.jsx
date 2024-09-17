import React, { useState, useEffect, useRef } from 'react';




const CartDrawer = () => {
  const [cart , setCart] = useState(null);
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
      setCart(prev => JSON.stringify(prev) !== JSON.stringify(cartData) ? cartData : prev);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    } 
  };



  useEffect(()=>{    
    if(cartOpen){
      debouncedWsDrawerActive() 
    }      
  },[cart , cartOpen])




  // Intercept Shopify AJAX API calls for adding, updating, or removing items
  const interceptCartActions = () => { 
    // Intercept fetch calls
    const originalFetch = window.fetch; 
    window.fetch = async function(url, options) {
      const response = await originalFetch(url, options);

      console.log(url, "url");

      if (url.includes('cart/add') || url.includes('cart/update.js') || url.includes('cart/change') || url.includes('cart/clear')) {
        if (response.ok) {
          setCartOpen(true);
          console.log(`${url} API call was successful`);
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



  useEffect(() => {
    
    // Call the intercept function to start monitoring Shopify API calls
    interceptCartActions();
    iconClickDrawerOpen();
    // Initial fetch of the cart data when the component mounts
    fetchCartData();
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
                  <svg
                  width="800px"
                  height="800px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"                  
                >
                  <path
                    d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 1 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414z"
                    fill="#0D0D0D"
                  />
                </svg>
                  </button>
              </div>
          </div>

          {cart && cart.items.length > 0 && (
            <ul className='ws-dr-items'>
              {cart.items.map(item => (
                <li className="ws-dr-item"  key={item.id}>
                    <div className='ws-item-inner'>
                        <button className="ws-dtl-btn" onClick={()=> updateCartQuantity(item.id , 0)}>
                                <svg fill="#000000" width="40px" height="40px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M831.24 280.772c5.657 0 10.24-4.583 10.24-10.24v-83.528c0-5.657-4.583-10.24-10.24-10.24H194.558a10.238 10.238 0 00-10.24 10.24v83.528c0 5.657 4.583 10.24 10.24 10.24H831.24zm0 40.96H194.558c-28.278 0-51.2-22.922-51.2-51.2v-83.528c0-28.278 22.922-51.2 51.2-51.2H831.24c28.278 0 51.2 22.922 51.2 51.2v83.528c0 28.278-22.922 51.2-51.2 51.2z"/><path d="M806.809 304.688l-58.245 666.45c-.544 6.246-6.714 11.9-12.99 11.9H290.226c-6.276 0-12.447-5.654-12.99-11.893L218.99 304.688c-.985-11.268-10.917-19.604-22.185-18.619s-19.604 10.917-18.619 22.185l58.245 666.45c2.385 27.401 26.278 49.294 53.795 49.294h445.348c27.517 0 51.41-21.893 53.796-49.301l58.244-666.443c.985-11.268-7.351-21.201-18.619-22.185s-21.201 7.351-22.185 18.619zM422.02 155.082V51.3c0-5.726 4.601-10.342 10.24-10.342h161.28c5.639 0 10.24 4.617 10.24 10.342v103.782c0 11.311 9.169 20.48 20.48 20.48s20.48-9.169 20.48-20.48V51.3c0-28.316-22.908-51.302-51.2-51.302H432.26c-28.292 0-51.2 22.987-51.2 51.302v103.782c0 11.311 9.169 20.48 20.48 20.48s20.48-9.169 20.48-20.48z"/><path d="M496.004 410.821v460.964c0 11.311 9.169 20.48 20.48 20.48s20.48-9.169 20.48-20.48V410.821c0-11.311-9.169-20.48-20.48-20.48s-20.48 9.169-20.48 20.48zm-192.435 1.767l39.936 460.964c.976 11.269 10.903 19.612 22.171 18.636s19.612-10.903 18.636-22.171l-39.936-460.964c-.976-11.269-10.903-19.612-22.171-18.636s-19.612 10.903-18.636 22.171zm377.856-3.535l-39.936 460.964c-.976 11.269 7.367 21.195 18.636 22.171s21.195-7.367 22.171-18.636l39.936-460.964c.976-11.269-7.367-21.195-18.636-22.171s-21.195 7.367-22.171 18.636z"/></svg>
                        </button>
                        <img className='ws-item-image' src={item.featured_image.url} alt={item.featured_image.alt} width={100} height={100}/>
                        <div className="ws-item-content">                             
                              <h4 className='ws-item-title'>{item.title}</h4>
                              <span className='ws-item-unit-price'>{item.presentment_price}</span>                              
                              <div className='ws-item-quantity-wrapper'>
                                  <button class="decrease" onClick={()=> decreaseValue(item.id)}>-</button>
                                  <input type="number" readonly className="ws-item-quantity-count" name="quantity" max={item.quantity_rule?.max} min={item.quantity_rule?.min} value={item.quantity} />
                                  <button class="increase" onClick={()=>increaseValue(item.id)}>+</button>
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
                          <li className='ws-dr-adi-item' data-id="note" onClick={() => handleTabClick('note')}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"> <path d="M 16 2 C 14.74 2 13.850156 2.89 13.410156 4 L 5 4 L 5 29 L 27 29 L 27 4 L 18.589844 4 C 18.149844 2.89 17.26 2 16 2 z M 16 4 C 16.55 4 17 4.45 17 5 L 17 6 L 20 6 L 20 8 L 12 8 L 12 6 L 15 6 L 15 5 C 15 4.45 15.45 4 16 4 z M 7 6 L 10 6 L 10 10 L 22 10 L 22 6 L 25 6 L 25 27 L 7 27 L 7 6 z M 9 13 L 9 15 L 11 15 L 11 13 L 9 13 z M 13 13 L 13 15 L 23 15 L 23 13 L 13 13 z M 9 17 L 9 19 L 11 19 L 11 17 L 9 17 z M 13 17 L 13 19 L 23 19 L 23 17 L 13 17 z M 9 21 L 9 23 L 11 23 L 11 21 L 9 21 z M 13 21 L 13 23 L 23 23 L 23 21 L 13 21 z" /> </svg></li>
                          <li style={{display: "none"}} className='ws-dr-adi-item' data-id="gift"  onClick={() => handleTabClick('gift')} ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"> <path d="M 12 5 C 10.355469 5 9 6.355469 9 8 C 9 8.351563 9.074219 8.683594 9.1875 9 L 4 9 L 4 15 L 5 15 L 5 28 L 27 28 L 27 15 L 28 15 L 28 9 L 22.8125 9 C 22.925781 8.683594 23 8.351563 23 8 C 23 6.355469 21.644531 5 20 5 C 18.25 5 17.0625 6.328125 16.28125 7.4375 C 16.175781 7.585938 16.09375 7.730469 16 7.875 C 15.90625 7.730469 15.824219 7.585938 15.71875 7.4375 C 14.9375 6.328125 13.75 5 12 5 Z M 12 7 C 12.625 7 13.4375 7.671875 14.0625 8.5625 C 14.214844 8.78125 14.191406 8.792969 14.3125 9 L 12 9 C 11.433594 9 11 8.566406 11 8 C 11 7.433594 11.433594 7 12 7 Z M 20 7 C 20.566406 7 21 7.433594 21 8 C 21 8.566406 20.566406 9 20 9 L 17.6875 9 C 17.808594 8.792969 17.785156 8.78125 17.9375 8.5625 C 18.5625 7.671875 19.375 7 20 7 Z M 6 11 L 26 11 L 26 13 L 17 13 L 17 12 L 15 12 L 15 13 L 6 13 Z M 7 15 L 25 15 L 25 26 L 17 26 L 17 16 L 15 16 L 15 26 L 7 26 Z" /> </svg></li>
                          <li style={{display: "none"}} className='ws-dr-adi-item' data-id="shippingrates" onClick={() => handleTabClick('shippingrates')}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"> <path d="M 1 4 L 1 25 L 4.15625 25 C 4.601563 26.71875 6.148438 28 8 28 C 9.851563 28 11.398438 26.71875 11.84375 25 L 20.15625 25 C 20.601563 26.71875 22.148438 28 24 28 C 25.851563 28 27.398438 26.71875 27.84375 25 L 31 25 L 31 14.59375 L 30.71875 14.28125 L 24.71875 8.28125 L 24.40625 8 L 19 8 L 19 4 Z M 3 6 L 17 6 L 17 23 L 11.84375 23 C 11.398438 21.28125 9.851563 20 8 20 C 6.148438 20 4.601563 21.28125 4.15625 23 L 3 23 Z M 19 10 L 23.5625 10 L 29 15.4375 L 29 23 L 27.84375 23 C 27.398438 21.28125 25.851563 20 24 20 C 22.148438 20 20.601563 21.28125 20.15625 23 L 19 23 Z M 8 22 C 9.117188 22 10 22.882813 10 24 C 10 25.117188 9.117188 26 8 26 C 6.882813 26 6 25.117188 6 24 C 6 22.882813 6.882813 22 8 22 Z M 24 22 C 25.117188 22 26 22.882813 26 24 C 26 25.117188 25.117188 26 24 26 C 22.882813 26 22 25.117188 22 24 C 22 22.882813 22.882813 22 24 22 Z" /> </svg></li>
                          <li className='ws-dr-adi-item' data-id="discount" onClick={() => handleTabClick('discount')} ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" > <path d="M 16 5 L 15.6875 5.28125 L 4.28125 16.8125 L 3.59375 17.5 L 4.28125 18.21875 L 13.78125 27.71875 L 14.5 28.40625 L 15.1875 27.71875 L 26.71875 16.3125 L 27 16 L 27 5 Z M 16.84375 7 L 25 7 L 25 15.15625 L 14.5 25.59375 L 6.40625 17.5 Z M 22 9 C 21.449219 9 21 9.449219 21 10 C 21 10.550781 21.449219 11 22 11 C 22.550781 11 23 10.550781 23 10 C 23 9.449219 22.550781 9 22 9 Z" /> </svg></li>
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
