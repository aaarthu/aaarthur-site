import profileImage from "@/assets/about-photo.png";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="px-6 pt-32 pb-16 md:px-12 md:pt-40 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Content */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="heading-hero italic mb-8"
              >
                {t("about.title")}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-dmsans space-y-6 leading-relaxed opacity-90"
              >
                <h1 className="font-zuume italic text-5xl">{t("about.greeting")}</h1>
                <p>{t("about.paragraph1")}</p>
                <p>{t("about.paragraph2")}</p>
                <p>{t("about.paragraph3")}</p>
                <p className="text-3xl font-zuume italic mt-4 md:text-5xl">
                  {t("about.cta")}
                </p>
              </motion.div>
            </div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="aspect-[3/4] bg-transparent rounded-lg overflow-hidden">
                <img
                  src={profileImage}
                  alt="Arthur - Graphic Designer"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
