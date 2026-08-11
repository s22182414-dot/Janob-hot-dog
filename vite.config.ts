import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    nitro({
      handlers: [
        {
          route: "/api/telegram/webhook",
          handler: "./server/routes/api/telegram/webhook.ts",
        },
        {
          route: "/api/telegram/connect",
          handler: "./server/routes/api/telegram/connect.ts",
        },
        {
          route: "/api/orders",
          handler: "./server/routes/api/orders.ts",
        },
        {
          route: "/api/admin/tg-auth",
          handler: "./server/routes/api/admin/tg-auth.ts",
        },
      ],
    }),
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
});
