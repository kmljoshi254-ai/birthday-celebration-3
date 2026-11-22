import type { Metadata } from "next";
import { Outfit, Architects_Daughter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const architectsDaughter = Architects_Daughter({
  variable: "--font-architects-daughter",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "US — Our Friendship Scrapbook 💖",
  description: "A digital scrapbook that happens to be alive.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${architectsDaughter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-text-ink font-sans bg-paper selection:bg-accent-pink/30 selection:text-text-ink">
        {children}
      </body>
    </html>
  );
}

