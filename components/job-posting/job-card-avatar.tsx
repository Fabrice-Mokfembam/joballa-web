"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type JobCardAvatarProps = {
  name: string;
  logoUrl?: string | null;
  initial?: string;
  className?: string;
  sizeClassName?: string;
};

export function JobCardAvatar({
  name,
  logoUrl,
  initial,
  className,
  sizeClassName = "size-6",
}: JobCardAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedInitial =
    initial?.trim() ||
    name.trim().charAt(0).toUpperCase() ||
    "?";

  useEffect(() => {
    setImageFailed(false);
  }, [logoUrl]);

  const showImage = Boolean(logoUrl?.trim()) && !imageFailed;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-[var(--joballa-avatar-bg)]",
        sizeClassName,
        className ?? "bg-[var(--joballa-primary)]",
      )}
    >
      {showImage ? (
        <Image
          src={logoUrl!}
          alt=""
          fill
          className="object-cover"
          sizes="24px"
          unoptimized={logoUrl!.startsWith("http")}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-[10px] font-bold text-[var(--joballa-on-primary)]">
          {resolvedInitial}
        </div>
      )}
    </div>
  );
}
