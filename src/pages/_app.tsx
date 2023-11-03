import { type Session } from "next-auth";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import SideNav from "~/components/SideNav";
import Head from "next/head";
import { type ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { env } from "~/env.mjs";

const nonAuthPaths = ["/public", "/api/auth"];

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const pathname = usePathname();

  const pathInNonAuthPaths = nonAuthPaths.some((path) =>
    pathname.startsWith(path),
  );

  const MainComponent = (
    <div className="container mx-auto min-h-screen flex-grow">
      <Component {...pageProps} />
    </div>
  );

  return (
    <SessionProvider session={session}>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || 0
          }`}
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
        `}
      </Script>
      <Head>
        <title>VetAI</title>
        <meta name="description" content="AI for your veterinary needs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex bg-gray-600 text-white">
        {pathInNonAuthPaths ? (
          MainComponent
        ) : (
          <Auth>
            <SideNav />
            {MainComponent}
          </Auth>
        )}
      </div>
    </SessionProvider>
  );
};

function Auth({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession({ required: true });
  const isUser = !!session?.user;

  useEffect(() => {
    if (status === "loading") return;
    if (!isUser) void signIn();
  }, [isUser, status]);

  if (isUser) {
    return children;
  }
}

export default api.withTRPC(MyApp);
