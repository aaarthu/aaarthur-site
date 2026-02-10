import { socialLinks } from "@/data/socialLinks";
import { cn } from "@/lib/utils";

import behanceSvg from "@/assets/social/behance.svg";
import instagramSvg from "@/assets/social/instagram.svg";
import linkedinSvg from "@/assets/social/linkedin.svg";
import tiktokSvg from "@/assets/social/tiktok.svg";
import whatsappSvg from "@/assets/social/whatsapp.svg";

type SocialIconsSize = "sm" | "md" | "lg";

interface SocialIconsProps {
  size?: SocialIconsSize;
  className?: string;
  iconClassName?: string;
}

const sizeMap: Record<SocialIconsSize, string> = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-9 h-9 md:w-10 md:h-10",
};

const colorFilter =
  "brightness-0 invert sepia saturate-[120%] hue-rotate-[330deg]";

function SocialLink({
  href,
  label,
  src,
  className,
}: {
  href: string;
  label: string;
  src: string;
  className: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
    >
      <img src={src} alt={label} className={className} />
    </a>
  );
}

export function SocialIcons({
  size = "sm",
  className,
  iconClassName,
}: SocialIconsProps) {
  const iconSize = sizeMap[size];

  const iconCls = cn(iconSize, colorFilter, iconClassName);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <SocialLink
        href={socialLinks.instagram}
        label="Instagram"
        src={instagramSvg}
        className={iconCls}
      />

      <SocialLink
        href={socialLinks.whatsapp}
        label="WhatsApp"
        src={whatsappSvg}
        className={iconCls}
      />

      <SocialLink
        href={socialLinks.behance}
        label="Behance"
        src={behanceSvg}
        className={iconCls}
      />

      <SocialLink
        href={socialLinks.linkedin}
        label="LinkedIn"
        src={linkedinSvg}
        className={iconCls}
      />

      <SocialLink
        href={socialLinks.tiktok}
        label="TikTok"
        src={tiktokSvg}
        className={iconCls}
      />
    </div>
  );
}
