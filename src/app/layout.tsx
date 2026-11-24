import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { QuranAppProvider } from '@/context/QuranAppContext';

export const metadata: Metadata = {
  title: 'رحلتي مع القرآن | الرفيق القرآني الذكي للحفظ والمراجعة',
  description: 'تطبيق إسلامي راقٍ لمتابعة رحلة حفظ القرآن الكريم، تنظيم التسميع مع الشيخ، وجدولة المراجعة بدون تشتت.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'رحلتي مع القرآن',
  },
};

export const viewport: Viewport = {
  themeColor: '#145A45',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body className="h-full antialiased selection:bg-[#145A45] selection:text-white">
        <AuthProvider>
          <QuranAppProvider>
            {children}
          </QuranAppProvider>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration error:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
