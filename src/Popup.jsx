import React, { useState, useEffect } from 'react';
// import {loveGesture} from "/images/loveGesture.webp"
// import {openPalm} from "/images/openPalm.webp"
// import {thumbsUp} from "/images/thumbsUp.webp";
// import {raisedFist} from "/images/raisedFist.webp";
// import {thumbsDown} from "/images/thumbsDown.webp";
// import {victoryHand} from "/images/victoryHand.webp";
// import {pointUp} from "/images/pointUP.webp"





const motionGestureData = [  
  {
    emoji: "/images/openPalm.webp",
    label: 'Thumbs Up',
    gif: 'https://s5.ezgif.com/tmp/ezgif-5-cfc28ea0ee.gif', // Add to cart GIF
  },
  {
    emoji: "/images/raisedFist.webp",
    label: 'Thumbs Up',
    gif: 'https://s5.ezgif.com/tmp/ezgif-5-cfc28ea0ee.gif', // Add to cart GIF
  },
  {
    emoji: '/images/loveGesture.webp',
    label: 'Love You Gesture',
    gif: 'https://media.giphy.com/media/3oEjHSbBJltjExTcoI/giphy.gif', // Open cart GIF
  },
  {
    emoji: "/images/victoryHand.webp",
    label: 'Victory Hand Gesture',
    gif: 'https://media.giphy.com/media/3oEjHSbBJltjExTcoI/giphy.gif', // Open cart GIF
  },
  {
    emoji: "/images/thumbsUp.webp",
    label: 'Thumbs Up',
    gif: 'https://s5.ezgif.com/tmp/ezgif-5-cfc28ea0ee.gif', // Add to cart GIF
  },
  {
    emoji: "/images/thumbsDown.webp",
    label: 'Thumbs Up',
    gif: 'https://s5.ezgif.com/tmp/ezgif-5-cfc28ea0ee.gif', // Add to cart GIF
  },
  {
    emoji: "/images/pointUP.webp",
    label: 'Pointing Up',
    gif: 'https://s5.ezgif.com/tmp/ezgif-5-cfc28ea0ee.gif', // Add to cart GIF
  }, 
  
];

const Popup = () => {
  const [isCameraGranted, setIsCameraGranted] = useState(true);
  const [selectedGesture, setSelectedGesture] = useState(0);

//   useEffect(() => {
//     if (!localStorage.getItem('popupShown')) {
//       requestCameraAccess();
//     }
//   }, []);

//   const requestCameraAccess = () => {
//     navigator.mediaDevices.getUserMedia({ video: true })
//       .then(() => {
//         setIsCameraGranted(true);
//         localStorage.setItem('popupShown', 'true');
//       })
//       .catch((err) => console.error("Camera access denied: ", err));
//   };

  if (!isCameraGranted) return null; // Hide the popup until camera access is granted

  return (
    <div className="motion-popup">
      <div className="motion-popup-header">
        <h2>Control your website with gestures</h2>
        <div className="motion-close-icon" onClick={() => setIsCameraGranted(false)}>
            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 1 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414z" fill="#0D0D0D"></path></svg>
        </div>
      </div>   
      <div className='parent-content'>  
        <div className="motion-gesture-tabs">
          {motionGestureData.map((gesture, index) => (
            <button
              key={index}
              className={`motion-tab-btn  motion-gesture-tab ${selectedGesture === index ? 'active' : ''}`}
              onClick={() => setSelectedGesture(index)}
            >
              <img src={gesture.emoji} width={40} height={40}/>
            
              <p className="motion-pop-label">{gesture.label}</p> 
                      
            </button>
          ))}
        </div>
        <div className="motion-popup-content">
          {selectedGesture !== null && (
            <div className="motion-gif-section">
              <img
                src={motionGestureData[selectedGesture].gif}
                alt={motionGestureData[selectedGesture].label}
                className="motion-gesture-gif"
              />
            </div>
          )}
        </div>
      </div>
      <div className="motion-popup-footer">
        <p>Control your site with gestures!</p>
      </div>
    </div>
  );
};

export default Popup;
