import Image from "next/image";
import { Fascinate } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fascinate = Fascinate({
  weight: "400",
  subsets: ["latin"],
});

type Size = "large" | "medium" | "small";
type Variant = "logo_and_brand_name" | "logo" | "brand_name";
type Theme = "dark" | "light" | "auto";

interface OrbitLogoProps {
  size?: Size;
  variant?: Variant;
  theme?: Theme;
  className?: string;
}

const OrbitLogo = ({
  size = "medium",
  variant = "logo_and_brand_name",
  theme = "auto", // Defaulting to auto
  className,
}: OrbitLogoProps) => {
  const sizeConfig = {
    small: {
      image: { width: 100, height: 30 },
      text: "text-xl md:text-3xl",
    },
    medium: {
      image: { width: 150, height: 50 },
      text: "text-3xl md:text-5xl",
    },
    large: {
      image: { width: 250, height: 80 },
      text: "text-5xl md:text-7xl",
    },
  };

  const currentSize = sizeConfig[size];

  const showLogo = variant === "logo_and_brand_name" || variant === "logo";
  const showBrandName =
    variant === "logo_and_brand_name" || variant === "brand_name";

  // Logic for Logo Inversion (Assuming original logo is dark/black)
  const logoClasses = cn(
    "object-contain shrink-0 transition-all",
    theme === "light" && "invert", // Force white
    theme === "dark" && "invert-0", // Force dark
    theme === "auto" && "dark:invert-0", // System: Invert only if system is light (assuming default logo is white)
    /* Note: If your /orbit-logo.webp is BLACK by default:
       theme === 'auto' should be 'dark:invert' 
    */
  );

  // Logic for Text Color
  const textClasses = cn(
    "tracking-tight transition-colors",
    fascinate.className,
    currentSize.text,
    theme === "light" && "text-white", // Force white text
    theme === "dark" && "text-slate-950", // Force dark text
    theme === "auto" && "text-foreground", // Use CSS variable (system theme)
  );

  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      {showLogo && (
        <Link href="/">
          <Image
            className={logoClasses}
            alt="Orbit Logo"
            src="/orbit-logo.webp"
            width={currentSize.image.width}
            height={currentSize.image.height}
            priority
          />
        </Link>
      )}

      {showBrandName && (
        <Link href="/" className={textClasses}>
          Orbit
        </Link>
      )}
    </div>
  );
};

export default OrbitLogo;
