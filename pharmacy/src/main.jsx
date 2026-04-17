import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./index.css";
import App from "./App.jsx";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing publishable key. Please set VITE_CLERK_PUBLISHABLE_KEY in your environment variables.",
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // البيانات تبقى "جديدة" لمدة 5 دقائق
      staleTime: 5 * 60 * 1000,
      // الاحتفاظ بالبيانات في الذاكرة لمدة 10 دقائق
      cacheTime: 10 * 60 * 1000,
      // إعادة المحاولة مرة واحدة عند الفشل
      retry: 1,
      // عدم إعادة جلب البيانات عند التركيز على النافذة
      refetchOnWindowFocus: false,
    },
    mutations: {
      // إعادة المحاولة مرة واحدة للـ mutations
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={publishableKey}>
        <QueryClientProvider client={queryClient}>
          <App />

          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
);
