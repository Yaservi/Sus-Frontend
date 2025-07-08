import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { WebSocketProvider } from "../context/WebSocketContext";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sus! Anonymous Messaging",
  description: "Send and receive anonymous messages",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <WebSocketProvider>
            <header>
              <Navbar />
            </header>
            <main className="flex-grow">
              {children}
            </main>
            <footer className="py-6 text-center text-gray-500 text-sm border-t">
              <div className="container mx-auto px-4">
              </div>
            </footer>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
