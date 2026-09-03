import Image from "next/image";
import Link from "next/link";
import mark from "../../public/logo-small.png";
import { cn } from "@/lib/utils";

/**
 * The Firsthand mark and wordmark. The mark is a PNG with a transparent
 * background; next/image serves it resized and as WebP where supported.
 */
export function Logo({
  size = 28,
  wordmark = true,
  href = "/",
  className,
  priority = false,
}: {
  size?: number;
  wordmark?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
}) {
  const inner = (
    <>
      <Image
        src={mark}
        alt={wordmark ? "" : "Firsthand"}
        height={size}
        width={Math.round(size * (mark.width / mark.height))}
        priority={priority}
        className="shrink-0"
      />
      {wordmark ? <span className="font-semibold tracking-tight">Firsthand</span> : null}
    </>
  );
  const cls = cn("inline-flex items-center gap-2 text-ink", className);
  return href ? (
    <Link href={href} className={cls} aria-label="Firsthand home">
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  );
}
