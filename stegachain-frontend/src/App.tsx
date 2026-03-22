import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { wagmiConfig } from "@/config/chains";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";
import { SenderPage } from "@/pages/SenderPage";
import { ReceiverPage } from "@/pages/ReceiverPage";

const queryClient = new QueryClient();

export function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/send" element={<SenderPage />} />
              <Route path="/receive" element={<ReceiverPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>

        <Toaster
          position="bottom-right"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: "rgb(17 24 39)",
              border: "1px solid rgb(55 65 81)",
              color: "rgb(243 244 246)",
            },
          }}
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
