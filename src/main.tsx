import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@radix-ui/themes/styles.css";
import { Theme, ThemePanel } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./global.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Theme>
        <ArweaveWalletKit
          config={{
            permissions: [
              "ACCESS_ADDRESS",
              "DISPATCH",
              "SIGN_TRANSACTION",
              "ACCESS_PUBLIC_KEY",
              "SIGNATURE",
            ],
          }}
        >
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                // left: "30%",
                padding: "var(--space-3)",
                width: "max-content",
                borderRadius: "max(var(--radius-2), var(--radius-full))",
              },
            }}
          />
          <App />
        </ArweaveWalletKit>
        <ThemePanel defaultOpen={false} />
      </Theme>
    </QueryClientProvider>
  </StrictMode>
);
