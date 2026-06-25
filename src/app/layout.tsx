import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#FF6B6B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Midday's",
  description: "Interactive early education app for preschoolers.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Midday's",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";
  return (
    <html
      lang="en"
      className={`${quicksand.variable} h-full antialiased`}
    >
      <head>
        {isDev && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    if (registrations.length > 0) {
                      registrations.forEach(function(registration) {
                        registration.unregister();
                      });
                      if ('caches' in window) {
                        caches.keys().then(function(keys) {
                          Promise.all(keys.map(function(key) {
                            return caches.delete(key);
                          })).then(function() {
                            window.location.reload();
                          });
                        });
                      } else {
                        window.location.reload();
                      }
                    }
                  });
                }
              `
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
