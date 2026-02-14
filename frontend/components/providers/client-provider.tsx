"use client";

import React from "react";

/**
 * ClientProvider — wraps children with any client-side providers
 * (auth context, global state, toast notifications, etc.)
 *
 * Currently a placeholder; will integrate Zustand stores and
 * auth context in subsequent steps.
 */
export function ClientProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
