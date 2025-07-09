'use client';

import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const username = searchParams.get('username');

  // Don't show navbar on anonymous message page
  const showNavbar = !username;

  return (
    <>
      {showNavbar && (
        <header>
          <Navbar />
        </header>
      )}
      <main className="flex-grow">
        {children}
      </main>
      {showNavbar && (
        <footer className="py-6 text-center text-gray-500 text-sm border-t">
          <div className="container mx-auto px-4">
          </div>
        </footer>
      )}
    </>
  );
}