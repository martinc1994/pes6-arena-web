import "./globals.css";

export const metadata = {
  title: "PES6 Arena — El evento más grande de PES6",
  description: "16 participantes, un microestadio real, shows en vivo y el PES6 como nunca lo viste. 21 de Noviembre 2026, Garín, Buenos Aires.",
  icons: {
    icon: '/logofondonegro.png',
  },
  openGraph: {
    title: 'PES6 Arena — El evento más grande de PES6',
    description: '16 participantes, un microestadio real, shows en vivo y el PES6 como nunca lo viste. 21 de Noviembre 2026.',
    siteName: 'PES6 Arena',
    images: [
      {
        url: '/logofondonegro.png',
        width: 800,
        height: 800,
        alt: 'PES6 Arena Logo',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
