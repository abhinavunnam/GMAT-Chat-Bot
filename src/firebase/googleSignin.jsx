import React, { useState, useEffect } from 'react';
import { getAuth, GoogleAuthProvider, signInWithRedirect, signInWithPopup } from 'firebase/auth';
import GoogleSignInButton from './googleSigninButton';

const FirebaseAuth = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || window.opera;
    setIsInAppBrowser(
      ua.indexOf("FBAN") > -1 || 
      ua.indexOf("FBAV") > -1 || 
      ua.indexOf("Instagram") > -1 ||
      ua.indexOf("Twitter") > -1 ||
      ua.indexOf("Line") > -1
    );
  }, []);

  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
    
      if (isDevelopment) {
        return await signInWithPopup(auth, provider);
      } else {
        return await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      setError('An error occurred during Google sign-in. Please try again.');
      console.error('Error signing in with Google:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const openInBrowser = () => {
    const currentURL = window.location.href;
    if (/android/i.test(navigator.userAgent)) {
      window.location.href = `intent://${currentURL.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      window.location.href = currentURL;
    } else {
      window.open(currentURL, '_blank');
    }
  };

  if (isInAppBrowser) {
    return (
      <div className="p-4 max-w-md mx-auto bg-yellow-100 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">In-App Browser Detected</h2>
        <p className="mb-4">
          For the best experience and to ensure successful sign-in, please open this page in your default mobile browser.
        </p>
        <div className="flex flex-col space-y-2">
          <button onClick={copyToClipboard}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button onClick={openInBrowser} style={{marginLeft:"2px"}}>
            Open in Browser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='Auth'>
      <div className="google-signin-container">
      <div onClick={handleGoogleSignIn}>
        {isGoogleLoading ? (<GoogleSignInButton disabled />) : <GoogleSignInButton />}
      </div>
      </div>
      <br></br>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default FirebaseAuth;