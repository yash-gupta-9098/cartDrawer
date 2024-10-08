import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import CartDrwer from './CartDrwer';
import Popup from './Popup';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const CartDRwerRoot = ReactDOM.createRoot(document.getElementById('evmcartdrawer'));
CartDRwerRoot.render(
  <React.StrictMode>
    <CartDrwer />
  </React.StrictMode>
);

const MotionPopRoot = ReactDOM.createRoot(document.getElementById('gesturePopup'));
MotionPopRoot.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
