import { Link } from "react-router";
import { useLang } from "@/lib/i18n";

const TEXT = {
  title: { en: "Page not found", kn: "ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ" },
  back: { en: "Back to all designs", kn: "ಎಲ್ಲಾ ವಿನ್ಯಾಸಗಳಿಗೆ ಹಿಂತಿರುಗಿ" },
};

export function NotFoundPage() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-navy">{t(TEXT.title)}</h1>
      <Link to="/" className="mt-4 inline-block font-semibold text-brand underline">
        {t(TEXT.back)}
      </Link>
    </section>
  );
}
