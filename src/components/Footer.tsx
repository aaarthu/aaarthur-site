import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FooterIcon from "@/assets/ICON_FOOTER2.svg";
import { SocialIcons } from "./SocialIcons";

export function Footer() {
  const { t } = useTranslation();

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.about"), path: "/about" },
    { label: t("nav.projects"), path: "/projects" },
    { label: t("nav.contact"), path: "/contact" },
  ];

  return (
    <footer className="bg-black text-[#fdf4e2] px-6 md:px-12 py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Logo */}
          <div className="md:pr-6">
            <img
              src={FooterIcon}
              alt="Arthur Design"
              className="w-auto max-w-[220px] md:max-w-[280px] h-auto"
              loading="lazy"
            />
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation" className="md:pt-1">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:gap-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="
                      font-zuume italic tracking-wider
                      text-xs md:text-base
                      link-editorial
                      opacity-80 hover:opacity-100
                      transition-opacity
                      whitespace-nowrap
                    "
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + Social */}
          <div className="md:text-right md:pt-1">
            <a
              href="mailto:arthurgomesdecastro@gmail.com"
              className="
                font-zuume italic tracking-wide
                text-xs md:text-base
                link-editorial
                opacity-90 hover:opacity-100
                transition-opacity
                break-words
              "
            >
              {t("footer.email")}
            </a>

            <div className="mt-2">
              <SocialIcons
                size="md"
                className="justify-start md:justify-end"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
