import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserbackProvider } from '@userback/react';
import { ThemeProvider } from './components/theme-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      refetchOnMount: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="tradepilot-theme">
    <QueryClientProvider client={queryClient}>
      <UserbackProvider token="A-toB4qf6TlycGzt55mrEgeMRHe">
        <App />
      </UserbackProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
