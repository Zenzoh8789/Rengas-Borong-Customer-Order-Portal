import { useEffect,useState } from "react";
import { resolveApiAssetUrl } from "../services/api";

const fallbackLogo = "/logo.png";

export function BrandLogo({
  size = 72,
  src,
  alt = "RENGAS logo",
  loading = "eager",
}: {
  size?: number;
  src?: string | null;
  alt?: string;
  loading?: "eager" | "lazy";
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showFallback = !src || failed;

  const imageUrl = showFallback
    ? fallbackLogo
    : resolveApiAssetUrl(src);

  return (
    <img
      className={`brand-logo ${showFallback ? "fallback-logo" : ""}`}
      src={imageUrl}
      width={size}
      height={size}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}