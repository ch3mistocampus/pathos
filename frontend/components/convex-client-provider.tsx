"use client";

import { ReactNode, useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new ConvexReactClient(
        process.env.NEXT_PUBLIC_CONVEX_URL ??
          "https://marvelous-swan-945.convex.cloud",
      ),
  );
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
