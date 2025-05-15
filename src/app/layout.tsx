import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserProvider";

export const metadata: Metadata = {
  title: "Facebook Auto Poster",
  description: "Facebook Auto Poster",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
