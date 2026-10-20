import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Our Little Universe",
    short_name: "Our Universe",
    description: "A private birthday experience.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF9F5",
    theme_color: "#5A2636",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
