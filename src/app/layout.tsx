import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-brand-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#FFB51F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Midday",
  description: "Sunshine-bright early-learning games for preschool phonics, logic, and creative play.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Midday",
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
      className={`${baloo.variable} ${nunito.variable} h-full antialiased`}
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
