import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PES 6 Arena",
  description: "Torneos y comunidad de PES 6. ¡Participá y demostrá que sos el mejor!",
  icons: {
    icon: '/logofondonegro.png',
  },
  openGraph: {
    title: 'PES 6 Arena',
    description: 'Torneos y comunidad de PES 6. ¡Participá y demostrá que sos el mejor!',
    siteName: 'PES 6 Arena',
    images: [
      {
        url: '/logofondonegro.png',
        width: 800,
        height: 800,
        alt: 'PES 6 Arena Logo',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
