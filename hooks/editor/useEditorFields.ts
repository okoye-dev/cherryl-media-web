import { useMemo, useState } from "react";
import { EMPTY_FIELDS, type EditorFields } from "@/lib/editor/fields";

type Update<K extends keyof EditorFields> = EditorFields[K] | ((prev: EditorFields[K]) => EditorFields[K]);

export function useEditorFields() {
  const [fields, setFields] = useState<EditorFields>(EMPTY_FIELDS);
  const [slugManual, setSlugManual] = useState(false);

  const set = useMemo(() => {
    const setter =
      <K extends keyof EditorFields>(key: K) =>
      (value: Update<K>) =>
        setFields((prev) => ({
          ...prev,
          [key]: typeof value === "function" ? (value as (p: EditorFields[K]) => EditorFields[K])(prev[key]) : value,
        }));
    return {
      title: setter("title"),
      subtitle: setter("subtitle"),
      excerpt: setter("excerpt"),
      kicker: setter("kicker"),
      slug: setter("slug"),
      category: setter("category"),
      authorName: setter("authorName"),
      authorRole: setter("authorRole"),
      status: setter("status"),
      sendWebpushr: setter("sendWebpushr"),
      tags: setter("tags"),
      id: setter("id"),
      coverUrl: setter("coverUrl"),
      coverCaption: setter("coverCaption"),
      coverCredit: setter("coverCredit"),
      blocks: setter("blocks"),
      relatedStories: setter("relatedStories"),
      seoTitle: setter("seoTitle"),
      seoSlug: setter("seoSlug"),
      seoDescription: setter("seoDescription"),
      xPost: setter("xPost"),
      fbPost: setter("fbPost"),
      liPost: setter("liPost"),
      nlPost: setter("nlPost"),
      sources: setter("sources"),
    };
  }, []);

  return { fields, setFields, set, slugManual, setSlugManual };
}

export type EditorFieldSetters = ReturnType<typeof useEditorFields>["set"];
