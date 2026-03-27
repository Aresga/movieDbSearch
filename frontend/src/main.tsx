import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import './index.css'
import App from './App.tsx'

/**
 * Configure React Query Client
 * retry: 1 - If a request fails, try one more time before showing an error.
 * staleTime: 60_000 - Keep data "fresh" for 1 minute (60,000ms) before refetching.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
})

// Initialize the React application and attach it to the DOM
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Provides data fetching and caching state to the entire app */}
    <QueryClientProvider client={queryClient}>
        {/* Enables accessible tooltips for UI components */}
      <TooltipProvider>
        <App />
            {/* Handles global toast notifications with 'richColors' for success/error styling */}
        <Toaster richColors position="bottom-right" />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
)
