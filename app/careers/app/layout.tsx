import type { Metadata } from "next";
import { Instrument_Serif, Poppins, Epilogue, Inter } from 'next/font/google';
import "./globals.css"

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument'
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
variable: '--font-epilogue'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "SPUP Careers",
  description: "Join our team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <body className={`${instrumentSerif.variable} ${poppins.variable} ${epilogue.variable} ${inter.variable} antialiased`}>        {children}
      </body>
    </html>
  );
}