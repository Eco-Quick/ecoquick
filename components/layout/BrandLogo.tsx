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
  const iconSize = size === "sm" ? 30 : 36;

  const wrapper = (
    <div className="flex items-center gap-2.5">
      <Image
        src="/ecoquick-logo.PNG"
        alt="EcoQuick logo"
        width={iconSize}
        height={iconSize}
        className="object-contain"
        priority
      />
      {withWordmark && (
        <span
          className={`font-extrabold uppercase tracking-tight text-zinc-950 dark:text-zinc-100 ${
            size === "sm" ? "text-sm" : "text-base sm:text-lg"
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

