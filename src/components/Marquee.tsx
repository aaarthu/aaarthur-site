import Lottie from "lottie-react";
import { useTranslation } from "react-i18next";
import bannerAnimationPT from "@/assets/BannerSitePT.json";
import bannerAnimationEN from "@/assets/BannerSiteEN.json";

export function Marquee() {
  const { i18n } = useTranslation();
  const bannerAnimation = i18n.language === "en" ? bannerAnimationEN : bannerAnimationPT;

  return (
    <div className="w-screen overflow-hidden">
      {/* A ALTURA é controlada aqui (mobile maior) */}
      <div className="h-[30px] sm:h-[140px] md:h-[110px] lg:h-[90px]">
        <Lottie
          animationData={bannerAnimation}
          loop
          style={{ width: "100%", height: "100%" }}
          rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
        />
      </div>
    </div>
  );
}