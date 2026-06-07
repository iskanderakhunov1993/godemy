import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Footer } from "@/components/Footer";

const METRIKA_ID = process.env.NEXT_PUBLIC_METRIKA_ID || ""

export const metadata: Metadata = {
  title: "Godemy — Интерактивный курс по Go",
  description: "Изучи Go с нуля через практику: интерактивный курс, тренажёр задач и Bootcamp с реальными проектами для резюме.",
  icons: {
    icon: "/icon.svg",
  },
  metadataBase: new URL("https://lavish-eagerness-production-a11a.up.railway.app"),
  openGraph: {
    title: "Godemy — Интерактивный курс по Go",
    description: "Изучи Go с нуля через практику: курс, тренажёр и Bootcamp с реальными проектами для резюме.",
    url: "https://lavish-eagerness-production-a11a.up.railway.app",
    siteName: "Godemy",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Godemy — Интерактивный курс по Go",
    description: "Изучи Go с нуля через практику: курс, тренажёр и Bootcamp с реальными проектами для резюме.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="bg-gray-950 text-gray-100 min-h-screen">
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
