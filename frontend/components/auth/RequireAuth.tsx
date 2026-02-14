"use client";

import React from "react";

/**
 * RequireAuth — placeholder auth guard component.
 *
 * Currently renders children directly. Will be wired up to
 * authentication context in a future step to redirect
 * unauthenticated users to the login page.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
