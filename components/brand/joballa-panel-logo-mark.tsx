import Image from "next/image";
import { cn } from "@/lib/utils";

const SRC = "/brand/joballa-panel-mark.png";

type Props = {
  className?: string;
  /** Width and height in pixels (default 40). */
  size?: number;
  /**
   * Accessible name. Use `""` when the mark is decorative next to a visible wordmark
   * (e.g. worker header “joballa” text).
   */
  alt?: string;
};

export function JoballaPanelLogoMark({ className, size = 40, alt = "Joballa" }: Props) {
  return (
    <Image
      src={SRC}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 select-none rounded-[22%] object-cover", className)}
      sizes={`${size}px`}
      priority
    />
  );
}
