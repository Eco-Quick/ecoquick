import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  withWordmark?: boolean;
  size?: "sm" | "md";
  labelSuffix?: string;
};

export function BrandLogo({
  href = "/",
  withWordmark = true,
  size = "md",
  labelSuffix,
}: BrandLogoProps) {
  const iconSize = size === "sm" ? 24 : 32;

  const wrapper = (
    <div className="flex items-center gap-2">
      <Image
        src="/ecoquick-logo.png"
        alt="EcoQuick logo"
        width={iconSize}
        height={iconSize}
        className="object-contain"
        priority
      />
      {withWordmark && (
        <span
          className={`font-extrabold uppercase tracking-tight text-zinc-950 dark:text-zinc-100 ${
            size === "sm" ? "text-[11px] sm:text-xs" : "text-sm sm:text-base"
          }`}
        >
          ECOQUICK{labelSuffix ? ` ${labelSuffix}` : ""}
        </span>
      )}
    </div>
  );

  return (
    <Link href={href} className="inline-flex items-center">
      {wrapper}
    </Link>
  );
}

