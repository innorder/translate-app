import { useTranslation } from "@/context/TranslationContext";
import { getTranslations } from "@/functions/i18translations";
import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const translations = await getTranslations(locale || "en", "default");

  return {
    props: { translations },
    revalidate: 3600, // Regenerate every hour
  };
};

const ExamplePage = () => {
  const { t, locale, setLocale, loading } = useTranslation();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t("welcome")}</h1>
      <p className="mb-4">{t("hello", { name: "User" })}</p>

      <div className="mb-4">
        <p>Current locale: {locale}</p>
        {loading && <p>Loading translations...</p>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setLocale("en")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          English
        </button>
        <button
          onClick={() => setLocale("fr")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          French
        </button>
        <button
          onClick={() => setLocale("es")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Spanish
        </button>
      </div>
    </div>
  );
};

export default ExamplePage;
