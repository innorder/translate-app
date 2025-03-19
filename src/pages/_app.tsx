import { AppProps } from "next/app";
import { TranslationProvider } from "@/context/TranslationContext";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { locale, defaultLocale } = router;

  return (
    <TranslationProvider
      initialLocale={locale || defaultLocale || "en"}
      initialTranslations={pageProps.translations || {}}
    >
      <Component {...pageProps} />
    </TranslationProvider>
  );
}

export default MyApp;
