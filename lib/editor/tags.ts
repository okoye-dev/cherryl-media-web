export const MAX_TAGS = 12;
export const MAX_TAG_LENGTH = 40;

export function cleanTag(raw: string): string {
  return raw.replace(/#/g, "").trim().slice(0, MAX_TAG_LENGTH);
}
