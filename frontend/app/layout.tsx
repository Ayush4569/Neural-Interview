import type { Metadata } from "next";
import { Mona_Sans} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Neural Interview",
  description: "An AI powered interview platform that helps you prepare for interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${monaSans.className} antialiased`}
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
      >
          <main >{children}</main>
      </body>
    </html>
  );
}
