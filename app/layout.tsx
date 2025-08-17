import type { Metadata } from "next";
import { Inter } from "next/font/google";
import FeedbackButton from "../src/components/ui/FeedbackButton";
import GoogleAnalytics from "../src/components/GoogleAnalytics";
import "../src/index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TripWise",
  description: "AI-powered travel planning app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        {children}
        <FeedbackButton />
      </body>
    </html>
  );
}
