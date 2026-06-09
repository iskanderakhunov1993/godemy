import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Footer } from "@/components/Footer";

const METRIKA_ID = process.env.NEXT_PUBLIC_METRIKA_ID || ""

export const metadata: Metadata = {
  title: "Godemy — Интерактивный курс по Go",
  description: "Изучи Go через практику: бесплатный курс с проектами, тренажёр задач и Bootcamp от Junior до Senior.",
  icons: {
    icon: "/icon.svg",
  },
  metadataBase: new URL("https://godemy.ru"),
  openGraph: {
    title: "Godemy — Интерактивный курс по Go",
    description: "Изучи Go через практику: бесплатный курс, тренажёр и Bootcamp от Junior до Senior.",
    url: "https://godemy.ru",
    siteName: "Godemy",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Godemy — Интерактивный курс по Go",
    description: "Изучи Go через практику: бесплатный курс, тренажёр и Bootcamp от Junior до Senior.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen text-gray-100">
        <ThemeProvider>
          <Navbar />
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>

          {/* Yandex Metrika */}
          {METRIKA_ID && (
            <>
              <Script id="ym-init" strategy="afterInteractive">
                {`
                  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                  (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
                  ym(${METRIKA_ID},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
                `}
              </Script>
              <noscript>
                <div>
                  <img src={`https://mc.yandex.ru/watch/${METRIKA_ID}`} style={{position:'absolute',left:'-9999px'}} alt="" />
                </div>
              </noscript>
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
