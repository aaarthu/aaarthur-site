import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SocialIcons } from "@/components/SocialIcons";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cx(
      "w-full rounded-2xl border px-3 py-2 text-sm",
      "bg-white text-neutral-900 placeholder:text-neutral-400",
      "focus:ring-2 focus:ring-neutral-900/10",
      props.className,
      props["aria-invalid"]
        ? "border-red-300 focus:border-red-400"
        : "border-neutral-200 focus:border-neutral-300"
    )}
  />
);

export const Textarea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) => (
  <textarea
    {...props}
    className={cx(
      "w-full rounded-2xl border px-3 py-2 text-sm",
      "bg-white text-neutral-900 placeholder:text-neutral-400",
      "focus:ring-2 focus:ring-neutral-900/10",
      props.className,
      props["aria-invalid"]
        ? "border-red-300 focus:border-red-400"
        : "border-neutral-200 focus:border-neutral-300"
    )}
  />
);

export const Field = ({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <div className="flex items-baseline justify-between gap-3">
      <label className="font-dmsans font-medium text-neutral-900 text-xs">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </div>
    {children}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={cx(
        "inline-block transition-transform duration-200 text-xs opacity-70",
        open ? "rotate-180" : "rotate-0"
      )}
      aria-hidden="true"
    >
      ▼
    </span>
  );
}

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === "en";

  // Define options based on language
  const NEED_OPTIONS = [
    t("contact.form.needOptions.visualIdentity"),
    t("contact.form.needOptions.graphicMaterials"),
    t("contact.form.needOptions.presentations"),
    t("contact.form.needOptions.artDirection"),
    t("contact.form.needOptions.motion"),
    t("contact.form.needOptions.other"),
  ] as const;

  type NeedOption = string;
  type TimelineOption = string;
  type BudgetOption = string;

  const TIMELINE_OPTIONS = [
    t("contact.form.timelineOptions.specificDate"),
    t("contact.form.timelineOptions.flexible"),
    t("contact.form.timelineOptions.notDefined"),
  ];

  const BUDGET_OPTIONS = [
    t("contact.form.budgetOptions.range1"),
    t("contact.form.budgetOptions.range2"),
    t("contact.form.budgetOptions.range3"),
    t("contact.form.budgetOptions.other"),
  ];

  const HAS_BRAND_OPTIONS = [
    t("contact.form.hasBrandOptions.yes"),
    t("contact.form.hasBrandOptions.no"),
  ];

  type FormState = {
    name: string;
    email: string;
    company: string;
    websiteOrSocial: string;
    businessType: string;
    needs: NeedOption[];
    needsOther: string;
    hasBrand: string;
    timeline: TimelineOption | "";
    timelineDate: string;
    budget: BudgetOption | "";
    budgetOther: string;
    extraInfo: string;
  };

  const initialState: FormState = {
    name: "",
    email: "",
    company: "",
    websiteOrSocial: "",
    businessType: "",
    needs: [],
    needsOther: "",
    hasBrand: "",
    timeline: "",
    timelineDate: "",
    budget: "",
    budgetOther: "",
    extraInfo: "",
  };

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  const [form, setForm] = useState<FormState>(initialState);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const otherOption = t("contact.form.needOptions.other");
  const budgetOtherOption = t("contact.form.budgetOptions.other");
  const specificDateOption = t("contact.form.timelineOptions.specificDate");

  const needsHasOther = form.needs.includes(otherOption);
  const budgetHasOther = form.budget === budgetOtherOption;
  const timelineHasSpecificDate = form.timeline === specificDateOption;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("contact.form.errors.name");
    if (!form.email.trim()) e.email = t("contact.form.errors.email");
    else if (!isValidEmail(form.email))
      e.email = t("contact.form.errors.emailInvalid");
    if (!form.businessType.trim())
      e.businessType = t("contact.form.errors.businessType");
    if (form.needs.length === 0) e.needs = t("contact.form.errors.needs");
    if (needsHasOther && !form.needsOther.trim())
      e.needsOther = t("contact.form.errors.needsOther");
    if (!form.hasBrand) e.hasBrand = t("contact.form.errors.hasBrand");
    if (!form.timeline) e.timeline = t("contact.form.errors.timeline");
    if (timelineHasSpecificDate && !form.timelineDate)
      e.timelineDate = t("contact.form.errors.timelineDate");
    if (!form.budget) e.budget = t("contact.form.errors.budget");
    if (budgetHasOther && !form.budgetOther.trim())
      e.budgetOther = t("contact.form.errors.budgetOther");
    return e;
  }, [form, needsHasOther, budgetHasOther, timelineHasSpecificDate, t]);

  const canSubmit = Object.keys(errors).length === 0;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function markTouched(name: keyof FormState | string) {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }

  function toggleNeed(option: NeedOption) {
    setForm((prev) => {
      const set = new Set(prev.needs);
      if (set.has(option)) set.delete(option);
      else set.add(option);

      const nextNeeds = Array.from(set);
      const next: FormState = {
        ...prev,
        needs: nextNeeds,
      };

      if (!nextNeeds.includes(otherOption)) next.needsOther = "";
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const allKeys: Array<keyof FormState> = [
      "name",
      "email",
      "company",
      "websiteOrSocial",
      "businessType",
      "needs",
      "needsOther",
      "hasBrand",
      "timeline",
      "timelineDate",
      "budget",
      "budgetOther",
      "extraInfo",
    ];

    setTouched((prev) => {
      const next = { ...prev };
      for (const k of allKeys) next[k] = true;
      return next;
    });

    if (!canSubmit) return;

    setStatus("submitting");

    const payload = {
      name: form.name,
      email: form.email,
      company: form.company,
      websiteOrSocial: form.websiteOrSocial,
      businessType: form.businessType,
      needs: form.needs,
      needsOther: needsHasOther ? form.needsOther : null,
      hasBrand: form.hasBrand,
      timeline: form.timeline,
      timelineDate: timelineHasSpecificDate ? form.timelineDate : null,
      budget: form.budget,
      budgetOther: budgetHasOther ? form.budgetOther : null,
      extraInfo: form.extraInfo,
    };

    try {
      const res = await fetch("https://formspree.io/f/mpqldvgp", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro no envio");

      setStatus("success");
      setForm(initialState);
      setTouched({});
    } catch (err) {
      setStatus("error");
    }
  }

  const showError = (key: keyof FormState) => touched[key] && errors[key];

  // Services data
  const services = [
    {
      id: "branding",
      title: t("contact.services.branding.title"),
      description: t("contact.services.branding.description"),
      items: t("contact.services.branding.items", {
        returnObjects: true,
      }) as string[],
    },
    {
      id: "marketing",
      title: t("contact.services.marketing.title"),
      description: t("contact.services.marketing.description"),
      items: t("contact.services.marketing.items", {
        returnObjects: true,
      }) as string[],
    },
    {
      id: "editorial",
      title: t("contact.services.editorial.title"),
      description: t("contact.services.editorial.description"),
      items: t("contact.services.editorial.items", {
        returnObjects: true,
      }) as string[],
    },
    {
      id: "presentations",
      title: t("contact.services.presentations.title"),
      description: t("contact.services.presentations.description"),
      items: t("contact.services.presentations.items", {
        returnObjects: true,
      }) as string[],
    },
    {
      id: "motion",
      title: t("contact.services.motion.title"),
      description: t("contact.services.motion.description"),
      items: t("contact.services.motion.items", {
        returnObjects: true,
      }) as string[],
    },
    {
      id: "artDirection",
      title: t("contact.services.artDirection.title"),
      description: t("contact.services.artDirection.description"),
      items: t("contact.services.artDirection.items", {
        returnObjects: true,
      }) as string[],
    },
  ];

  // ✅ multi-open + começa tudo fechado
  const [openServiceIds, setOpenServiceIds] = useState<string[]>([]);
  const toggleService = (id: string) => {
    setOpenServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Título do formulário (i18n com fallback)
  const formTitle =
    t("contact.formTitle", {
      defaultValue: isEnglish ? "Request a quote" : "Peça um orçamento",
    }) as string;

  const formSubtitle =
    t("contact.formSubtitle", {
      defaultValue: isEnglish
        ? "Tell me what you need and I’ll get back to you soon."
        : "Conte o que você precisa e eu retorno em breve.",
    }) as string;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-32 md:pt-40">
        <div className="relative flex items-center justify-center px-4 md:px-8">
          <div
            className="relative w-full max-w-4xl bg-[#f9b126] rounded-2xl md:rounded-3xl"
            style={{ transform: "skewX(-5deg)" }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ transform: "skewX(5deg)" }}
              className="font-zuume text-[2.5rem] md:text-[5rem] lg:text-[6.5rem] leading-[0.9] italic tracking-wide text-white text-center py-6 md:py-10 px-4 md:px-8"
            >
              {t("contact.heroTitle")}
            </motion.h1>
          </div>
        </div>

        {/* Contact Section */}
        <section className="bg-accent-blue text-white min-h-[calc(100vh-8rem)]">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
              {/* Left Column - Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-12"
              >
                {/* Email + Phone + Social Icons */}
                <div>
                  <h3 className="font-zuume text-sm tracking-widest mb-3 opacity-80">
                    {t("contact.contactLabel")}
                  </h3>

                  <a
                    href="mailto:arthurgomesdecastro@gmail.com"
                    className="font-zuume text-xl md:text-2xl italic tracking-wide hover:text-cream transition-colors"
                  >
                    ARTHURGOMESDECASTRO@GMAIL.COM
                  </a>

                  <br />

                  <a
                    href="tel:+5511937070607"
                    className="font-zuume text-xl md:text-2xl italic tracking-wide hover:text-cream transition-colors"
                  >
                    + 55 11 93707-0607
                  </a>

                  {/* ÍCONES ABAIXO DO TELEFONE */}
                  <SocialIcons size="md" className="mt-4" />
                </div>

                {/* Serviços Prestados (COLAPSÁVEL / MULTI-OPEN) */}
                <div className="space-y-6">
                  <h3 className="font-zuume text-sm tracking-widest mb-2 opacity-80">
                    {t("contact.servicesLabel")}
                  </h3>

                  <div className="space-y-3">
                    {services.map((service) => {
                      const isOpen = openServiceIds.includes(service.id);

                      return (
                        <div
                          key={service.id}
                          className="border-b border-white/15 pb-3"
                        >
                          <button
                            type="button"
                            onClick={() => toggleService(service.id)}
                            className={cx(
                              "w-full flex items-center justify-between gap-3 text-left",
                              "font-zuume text-xl italic tracking-wide",
                              "hover:opacity-90 transition-opacity"
                            )}
                            aria-expanded={isOpen}
                          >
                            <span>{service.title}</span>
                            <Chevron open={isOpen} />
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                <div className="pt-3">
                                  <p className="font-dmsans text-sm leading-relaxed opacity-80 mb-3">
                                    {service.description}
                                  </p>

                                  <ul className="font-dmsans text-sm opacity-75 space-y-1 pl-4">
                                    {service.items.map((item, idx) => (
                                      <li key={idx}>• {item}</li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Contact Form */}
              <div className="w-full">
                {status === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-3xl bg-white p-8 md:p-12 shadow-sm border border-neutral-100 text-center lg:col-span-2"
                  >
                    <div className="max-w-md mx-auto">
                      <div className="mb-6">
                        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-4">
                        {t("contact.form.success.title")}
                      </h2>

                      <p className="text-neutral-600 mb-8 text-base md:text-lg">
                        {t("contact.form.success.message")}
                      </p>

                      <button
                        onClick={() => setStatus("idle")}
                        className="rounded-2xl px-6 py-3 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                      >
                        {t("contact.form.success.sendAnother")}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* ✅ TÍTULO ACIMA DO FORMULÁRIO */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="mb-4"
                    >
                      <h2 className="font-zuume italic tracking-wide text-3xl md:text-4xl text-[#fdf4e3] leading-[0.95]">
                        {formTitle}
                      </h2>
                      <p className="font-dmsans text-sm md:text-base opacity-80 mt-2">
                        {formSubtitle}
                      </p>
                    </motion.div>

                    <form
                      onSubmit={onSubmit}
                      className="font-dmsans rounded-3xl bg-white p-6 shadow-sm border border-neutral-100"
                    >
                      <input
                        type="hidden"
                        name="form_type"
                        value="Solicitação de Orçamento"
                      />

                      <div className="grid gap-5">
                        <div className="grid gap-5 md:grid-cols-2">
                          <Field
                            label={t("contact.form.name")}
                            required
                            error={showError("name") || undefined}
                          >
                            <Input
                              name="name"
                              value={form.name}
                              onChange={(e) => update("name", e.target.value)}
                              onBlur={() => markTouched("name")}
                              placeholder={isEnglish ? "Your name" : "Seu nome"}
                              aria-invalid={!!showError("name")}
                              required
                            />
                          </Field>

                          <Field
                            label={t("contact.form.email")}
                            required
                            error={showError("email") || undefined}
                          >
                            <Input
                              name="email"
                              value={form.email}
                              onChange={(e) => update("email", e.target.value)}
                              onBlur={() => markTouched("email")}
                              placeholder={
                                isEnglish
                                  ? "you@company.com"
                                  : "voce@empresa.com"
                              }
                              aria-invalid={!!showError("email")}
                              inputMode="email"
                              required
                            />
                          </Field>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <Field
                            label={t("contact.form.company")}
                            hint={t("contact.form.optional")}
                          >
                            <Input
                              name="company"
                              value={form.company}
                              onChange={(e) =>
                                update("company", e.target.value)
                              }
                              onBlur={() => markTouched("company")}
                              placeholder={
                                isEnglish ? "Company name" : "Nome da empresa"
                              }
                            />
                          </Field>

                          <Field
                            label={t("contact.form.websiteOrSocial")}
                            hint={t("contact.form.optional")}
                          >
                            <Input
                              name="websiteOrSocial"
                              value={form.websiteOrSocial}
                              onChange={(e) =>
                                update("websiteOrSocial", e.target.value)
                              }
                              onBlur={() => markTouched("websiteOrSocial")}
                              placeholder="URL / @profile"
                            />
                          </Field>
                        </div>

                        <Field
                          label={t("contact.form.businessType")}
                          required
                          error={showError("businessType") || undefined}
                        >
                          <Textarea
                            name="businessType"
                            rows={3}
                            value={form.businessType}
                            onChange={(e) =>
                              update("businessType", e.target.value)
                            }
                            onBlur={() => markTouched("businessType")}
                            placeholder={t(
                              "contact.form.businessTypePlaceholder"
                            )}
                            aria-invalid={!!showError("businessType")}
                            required
                          />
                        </Field>

                        <Field
                          label={t("contact.form.needs")}
                          required
                          error={showError("needs") || undefined}
                          hint={
                            isEnglish ? "multiple choice" : "múltipla escolha"
                          }
                        >
                          <div className="grid gap-2 sm:grid-cols-2">
                            {NEED_OPTIONS.map((opt) => (
                              <label
                                key={opt}
                                className={cx(
                                  "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm cursor-pointer select-none",
                                  form.needs.includes(opt)
                                    ? "border-neutral-300 bg-neutral-50"
                                    : "border-neutral-200 bg-white"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  name="needs[]"
                                  value={opt}
                                  checked={form.needs.includes(opt)}
                                  onChange={() => toggleNeed(opt)}
                                  className="h-4 w-4"
                                />
                                <span className="text-neutral-800">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </Field>

                        {needsHasOther ? (
                          <Field
                            label={
                              isEnglish
                                ? "If you chose 'Other', please specify"
                                : "Se escolheu 'Outro', especifique"
                            }
                            required
                            error={showError("needsOther") || undefined}
                          >
                            <Input
                              name="needsOther"
                              value={form.needsOther}
                              onChange={(e) =>
                                update("needsOther", e.target.value)
                              }
                              onBlur={() => markTouched("needsOther")}
                              placeholder={
                                isEnglish
                                  ? "Briefly describe"
                                  : "Descreva rapidamente"
                              }
                              aria-invalid={!!showError("needsOther")}
                              required
                            />
                          </Field>
                        ) : null}

                        <Field
                          label={t("contact.form.hasBrand")}
                          required
                          error={showError("hasBrand") || undefined}
                        >
                          <div className="grid gap-2 sm:grid-cols-2">
                            {HAS_BRAND_OPTIONS.map((opt) => (
                              <label
                                key={opt}
                                className={cx(
                                  "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm cursor-pointer select-none",
                                  form.hasBrand === opt
                                    ? "border-neutral-300 bg-neutral-50"
                                    : "border-neutral-200 bg-white"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="hasBrand"
                                  value={opt}
                                  checked={form.hasBrand === opt}
                                  onChange={() => update("hasBrand", opt)}
                                  className="h-4 w-4"
                                  required
                                />
                                <span className="text-neutral-800">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </Field>

                        <Field
                          label={t("contact.form.timeline")}
                          required
                          hint={isEnglish ? "single choice" : "opção única"}
                          error={showError("timeline") || undefined}
                        >
                          <div className="grid gap-2">
                            {TIMELINE_OPTIONS.map((opt) => (
                              <label
                                key={opt}
                                className={cx(
                                  "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm cursor-pointer select-none",
                                  form.timeline === opt
                                    ? "border-neutral-300 bg-neutral-50"
                                    : "border-neutral-200 bg-white"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="timeline"
                                  value={opt}
                                  checked={form.timeline === opt}
                                  onChange={() => {
                                    update("timeline", opt);
                                    if (opt !== specificDateOption)
                                      update("timelineDate", "");
                                  }}
                                  className="h-4 w-4"
                                  required
                                />
                                <span className="text-neutral-800">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </Field>

                        {timelineHasSpecificDate ? (
                          <Field
                            label={t("contact.form.timelineDate")}
                            required
                            error={showError("timelineDate") || undefined}
                          >
                            <Input
                              name="timelineDate"
                              type="date"
                              value={form.timelineDate}
                              onChange={(e) =>
                                update("timelineDate", e.target.value)
                              }
                              onBlur={() => markTouched("timelineDate")}
                              aria-invalid={!!showError("timelineDate")}
                              required
                            />
                          </Field>
                        ) : null}

                        <Field
                          label={t("contact.form.budget")}
                          required
                          hint={isEnglish ? "single choice" : "opção única"}
                          error={showError("budget") || undefined}
                        >
                          <div className="grid gap-2">
                            {BUDGET_OPTIONS.map((opt) => (
                              <label
                                key={opt}
                                className={cx(
                                  "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm cursor-pointer select-none",
                                  form.budget === opt
                                    ? "border-neutral-300 bg-neutral-50"
                                    : "border-neutral-200 bg-white"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="budget"
                                  value={opt}
                                  checked={form.budget === opt}
                                  onChange={() => {
                                    update("budget", opt);
                                    if (opt !== budgetOtherOption)
                                      update("budgetOther", "");
                                  }}
                                  className="h-4 w-4"
                                  required
                                />
                                <span className="text-neutral-800">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </Field>

                        {budgetHasOther ? (
                          <Field
                            label={
                              isEnglish
                                ? "If you chose 'Other', please specify"
                                : "Se escolheu 'Outro', especifique"
                            }
                            required
                            error={showError("budgetOther") || undefined}
                          >
                            <Input
                              name="budgetOther"
                              value={form.budgetOther}
                              onChange={(e) =>
                                update("budgetOther", e.target.value)
                              }
                              onBlur={() => markTouched("budgetOther")}
                              placeholder={
                                isEnglish ? "E.g.: $5,000" : "Ex.: R$ 7.500"
                              }
                              aria-invalid={!!showError("budgetOther")}
                              required
                            />
                          </Field>
                        ) : null}

                        <Field
                          label={t("contact.form.extraInfo")}
                          hint={t("contact.form.optional")}
                        >
                          <Textarea
                            name="extraInfo"
                            rows={4}
                            value={form.extraInfo}
                            onChange={(e) => update("extraInfo", e.target.value)}
                            onBlur={() => markTouched("extraInfo")}
                            placeholder={
                              isEnglish
                                ? "Context, references, expected deliverables, constraints, internal deadlines..."
                                : "Contexto, referências, entregáveis esperados, restrições, prazos internos..."
                            }
                          />
                        </Field>

                        <div className="flex items-center justify-between gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setForm(initialState);
                              setTouched({});
                              setStatus("idle");
                            }}
                            className="rounded-2xl px-4 py-2 text-sm border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
                          >
                            {isEnglish ? "Clear" : "Limpar"}
                          </button>

                          <button
                            type="submit"
                            disabled={!canSubmit || status === "submitting"}
                            className={cx(
                              "rounded-2xl px-5 py-2 text-sm font-medium",
                              canSubmit && status !== "submitting"
                                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                                : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                            )}
                          >
                            {status === "submitting"
                              ? t("contact.form.submitting")
                              : t("contact.form.submit")}
                          </button>
                        </div>

                        {status === "error" ? (
                          <p className="text-sm text-red-600">
                            {isEnglish
                              ? "Could not submit. Please try again."
                              : "Não foi possível enviar. Tente novamente."}
                          </p>
                        ) : null}
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
