import { OG_ALT, OG_CONTENT_TYPE, OG_SIZE, renderPathosOgImage } from "./_shared-og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = OG_ALT;

export default function TwitterImage() {
  return renderPathosOgImage();
}
