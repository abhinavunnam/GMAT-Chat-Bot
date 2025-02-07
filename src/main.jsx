import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from "./components/theme-provider.jsx"
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCtG2MynZAIu366TNrJIQkulsmUVcJb7SE",
    authDomain: "gmatchatbot.firebaseapp.com",
    projectId: "gmatchatbot",
    storageBucket: "gmatchatbot.firebasestorage.app",
    messagingSenderId: "289644806117",
    appId: "1:289644806117:web:5049934f44b1738d9cb90c",
    measurementId: "G-NLR3JE9XP4"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
  