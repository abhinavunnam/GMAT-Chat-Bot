import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from "./components/theme-provider.jsx"
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "gmat-chat-bot.firebaseapp.com",
  projectId: "gmat-chat-bot",
  storageBucket: "gmat-chat-bot.appspot.app",
  messagingSenderId: "948998349188",
  appId: "1:948998349188:web:6e679510034664f9187dd1",
  measurementId: "G-PJ33S0CB4F"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
  