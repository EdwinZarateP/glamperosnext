// src/components/ClientProviders.tsx
"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ProveedorVariables } from "@/context/AppContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId="870542988514-rbpof111fdk5vlbn75vi62i06moko46s.apps.googleusercontent.com">
      <ProveedorVariables>{children}</ProveedorVariables>
    </GoogleOAuthProvider>
  );
}
