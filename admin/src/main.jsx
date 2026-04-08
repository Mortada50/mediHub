import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from "@clerk/clerk-react";
import './index.css'
import App from './App.jsx'

const publishableKey = import.meta.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing publishable key. Please set REACT_APP_CLERK_PUBLISHABLE_KEY in your environment variables.");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);


 
