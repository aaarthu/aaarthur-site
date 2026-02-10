import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SocialIcons } from "./SocialIcons";

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.about"), path: "/about" },
    { label: t("nav.projects"), path: "/projects" },
    { label: t("nav.contact"), path: "/contact" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-12 md:py-6 bg-[#feb21b] text-slate-950"
    >
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="font-zuume font-bold italic text-base sm:text-xl md:text-3xl tracking-wider text-[#fdf4e2] whitespace-nowrap"
          onClick={closeMenu}
        >
          {t("header.logo")}
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`font-zuume text-sm tracking-wider italic link-editorial transition-opacity ${
                  location.pathname === item.path
                    ? "opacity-100"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Language Selector */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => changeLanguage("pt")}
            className={`font-zuume text-sm tracking-wider italic link-editorial transition-opacity ${
              i18n.language === "pt"
                ? "opacity-100"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            PT
          </button>
          <span className="text-[#fdf4e2] opacity-50">/</span>
          <button
            onClick={() => changeLanguage("en")}
            className={`font-zuume text-sm tracking-wider italic link-editorial transition-opacity ${
              i18n.language === "en"
                ? "opacity-100"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            EN
          </button>
        </div>

        {/* Desktop Social Icons (✅ mais legíveis) */}
        <div className="hidden md:block">
          <SocialIcons size="md" />
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden relative z-50 w-8 h-8 flex flex-col justify-center items-center gap-1.5 flex-shrink-0"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="w-6 h-0.5 bg-[#fdf4e2] transition-all"
          />
          <motion.span
            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="w-6 h-0.5 bg-[#fdf4e2] transition-all"
          />
          <motion.span
            animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="w-6 h-0.5 bg-[#fdf4e2] transition-all"
          />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-[#feb21b]"
          >
            <ul className="flex flex-col items-center gap-6 py-8">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeMenu}
                    className={`font-zuume text-sm tracking-wider italic link-editorial transition-opacity ${
                      location.pathname === item.path
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Language Selector */}
            <div className="flex items-center justify-center gap-2 pb-4">
              <button
                onClick={() => changeLanguage("pt")}
                className={`font-zuume text-sm tracking-wider italic link-editorial transition-opacity ${
                  i18n.language === "pt"
                    ? "opacity-100"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                PT
              </button>
              <span className="text-[#fdf4e2] opacity-50">/</span>
              <button
                onClick={() => changeLanguage("en")}
                className={`font-zuume text-sm tracking-wider italic link-editorial transition-opacity ${
                  i18n.language === "en"
                    ? "opacity-100"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                EN
              </button>
            </div>

            {/* Mobile Social Icons (✅ mais legíveis) */}
            <div className="flex justify-center pb-6">
              <SocialIcons size="md" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
