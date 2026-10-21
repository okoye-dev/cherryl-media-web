import {
  type EditorialCopy,
  DEFAULT_EDITORIAL_COPY,
  fetchEditorialCopy,
  updateEditorialCopy,
} from "@/services/settings";

export type { EditorialCopy };
export { DEFAULT_EDITORIAL_COPY };

export async function getEditorialCopy(): Promise<EditorialCopy> {
  return fetchEditorialCopy();
}

export async function saveEditorialCopy(copy: EditorialCopy): Promise<EditorialCopy> {
  return updateEditorialCopy(copy);
}
