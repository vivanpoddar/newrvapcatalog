import './globals.css';
import "@radix-ui/themes/styles.css";

import { Analytics } from '@vercel/analytics/react';
import { Theme } from "@radix-ui/themes";

export const metadata = {
  title: 'Ashrama Catalog',
  description:
    'Ramakrishna Vedanta Ashrama of Pittsburgh Digital Library and Catalog. Explore spiritual literature, teachings, and resources.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <title>Digital Catalog</title>
      </head>
      <body className="flex min-h-screen w-full flex-col">
        <Theme>{children}</Theme>
        <Analytics />
      </body>
    </html>
  );
}
