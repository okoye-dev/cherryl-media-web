import { useCallback, useEffect, useRef, useState } from "react";
import type { ContentBlock } from "@/lib/types";
import { cleanTag, MAX_TAGS, type useArticleEditor } from "@/hooks/useArticleEditor";
import type { AiFilled } from "@/hooks/useAiFilled";
import type { useVersions } from "@/hooks/useVersions";
import { blockKey, isAiBlock, parsePastedJson, type AiPatch } from "@/hooks/aiFill";
import type { LeadCandidate } from "@/services/articles";
import { leadToPatch } from "@/hooks/aiFill";

type Editor = ReturnType<typeof useArticleEditor>;
type Versions = ReturnType<typeof useVersions>;

const DEFAULT_KICKER = "NEWSROOM · DESK DISPATCH";
const PLACEHOLDER_TEXT = "Draft your opening paragraph here...";

const blankBlock = (): ContentBlock => ({ order_id: 1, type: "paragraph", text: "", isDropCap: true });

function bodyIsEmpty(blocks: ContentBlock[]): boolean {
  return blocks.every((b) => b.type === "paragraph" && (!b.text.trim() || b.text.trim() === PLACEHOLDER_TEXT));
}

export interface ApplyResult {
  filled: number;
  skipped: number;
}

/**
 * Puts AI content into the editor without overwriting what a person typed,
 * remembers which fields are AI filled, and saves the first AI draft as a version.
 */
export function useAiAssist(editor: Editor, ai: AiFilled, versions: Versions, lead: LeadCandidate | null) {
  const [leadApplied, setLeadApplied] = useState(false);
  const [needsSnapshot, setNeedsSnapshot] = useState(false);
  const aiTags = useRef<string[]>([]);
  const aiSourceUrls = useRef<string[]>([]);
  const autoApplied = useRef<string | null>(null);

  const applyPatch = useCallback(
    (patch: AiPatch, replaceCategory: boolean): ApplyResult => {
      const keys: string[] = [];
      let skipped = 0;
      const canWrite = (current: string, key: string, empty = (v: string) => !v.trim()) =>
        empty(current) || ai.has(key);

      const text = (key: string, value: string | undefined, current: string, set: (v: string) => void) => {
        if (value === undefined) return;
        if (canWrite(current, key)) {
          set(value);
          keys.push(key);
        } else skipped += 1;
      };

      text("title", patch.title, editor.title, editor.handleTitleChange);
      text("subtitle", patch.subtitle, editor.subtitle, editor.setSubtitle);
      text("excerpt", patch.excerpt, editor.excerpt, editor.setExcerpt);
      if (patch.kicker !== undefined) {
        if (editor.kicker === DEFAULT_KICKER || !editor.kicker.trim() || ai.has("kicker")) {
          editor.setKicker(patch.kicker);
          keys.push("kicker");
        } else skipped += 1;
      }
      if (patch.category && replaceCategory) {
        editor.setCategory(patch.category);
        keys.push("category");
      }
      if (patch.tags) {
        const room = Math.max(0, MAX_TAGS - editor.tags.length);
        const fresh = patch.tags.map(cleanTag).filter((t) => t && !editor.tags.includes(t)).slice(0, room);
        fresh.forEach((t) => editor.addTag(t));
        aiTags.current = [...aiTags.current, ...fresh];
        if (fresh.length) keys.push("tags");
      }
      if (patch.body) {
        const mine = editor.blocks.filter((b) => !isAiBlock(b));
        if (bodyIsEmpty(mine)) {
          editor.setBlocks(patch.body.map((b, i) => ({ ...b, order_id: i + 1 })));
          keys.push(...patch.body.map(blockKey));
        } else skipped += 1;
      }
      if (patch.sources) {
        const known = new Set(editor.sources.map((s) => s.url).filter(Boolean));
        const fresh = patch.sources.filter((s) => !s.url || !known.has(s.url));
        if (fresh.length) {
          editor.setSources((prev) => [...prev.filter((s) => s.url || s.publisher || s.claimSummary), ...fresh]);
          aiSourceUrls.current = [...aiSourceUrls.current, ...fresh.map((s) => s.url)];
          keys.push("sources");
        }
      }
      text("seoTitle", patch.seoTitle, editor.seoTitle, editor.setSeoTitle);
      text("seoDescription", patch.seoDescription, editor.seoDescription, editor.setSeoDescription);
      if (patch.social) {
        text("x", patch.social.x, editor.xPost, editor.setXPost);
        text("facebook", patch.social.facebook, editor.fbPost, editor.setFbPost);
        text("linkedin", patch.social.linkedin, editor.liPost, editor.setLiPost);
        text("newsletter", patch.social.newsletter, editor.nlPost, editor.setNlPost);
      }

      ai.mark(keys);
      if (keys.length > 0) setNeedsSnapshot(true);
      return { filled: keys.length, skipped };
    },
    [editor, ai]
  );

  const applyLead = useCallback(() => {
    if (!lead) return;
    // A lead only fills a story that has not been started
    const fresh = !editor.title.trim();
    const res = applyPatch(leadToPatch(lead), fresh);
    if (res.filled > 0) setLeadApplied(true);
  }, [lead, editor.title, applyPatch]);

  // Fill the story once when the lead arrives
  const applyLeadRef = useRef(applyLead);
  applyLeadRef.current = applyLead;
  useEffect(() => {
    if (!lead || autoApplied.current === lead.id) return;
    autoApplied.current = lead.id;
    applyLeadRef.current();
  }, [lead]);

  const applyPaste = useCallback(
    (raw: string): { ok: true; result: ApplyResult } | { ok: false; error: string } => {
      const parsed = parsePastedJson(raw);
      if (!parsed.ok) return parsed;
      return { ok: true, result: applyPatch(parsed.patch, true) };
    },
    [applyPatch]
  );

  // Save the first AI draft as a version, after the new text is in the editor
  useEffect(() => {
    if (!needsSnapshot) return;
    setNeedsSnapshot(false);
    if (!versions.hasAiNow()) versions.save("ai", "AI draft", editor.currentPayload);
  }, [needsSnapshot, versions, editor.currentPayload]);

  /** Remove only what AI filled. Anything the person has edited stays. */
  const clearAiFields = useCallback(() => {
    if (ai.has("title")) editor.handleTitleChange("");
    if (ai.has("subtitle")) editor.setSubtitle("");
    if (ai.has("excerpt")) editor.setExcerpt("");
    if (ai.has("kicker")) editor.setKicker(DEFAULT_KICKER);
    if (ai.has("tags")) aiTags.current.forEach((t) => editor.removeTag(t));
    if (ai.has("sources")) editor.setSources((prev) => prev.filter((s) => !aiSourceUrls.current.includes(s.url)));
    if (ai.has("seoTitle")) editor.setSeoTitle("");
    if (ai.has("seoDescription")) editor.setSeoDescription("");
    if (ai.has("x")) editor.setXPost("");
    if (ai.has("facebook")) editor.setFbPost("");
    if (ai.has("linkedin")) editor.setLiPost("");
    if (ai.has("newsletter")) editor.setNlPost("");
    if (editor.blocks.some(isAiBlock)) {
      const rest = editor.blocks.filter((b) => !isAiBlock(b));
      editor.setBlocks(rest.length ? rest.map((b, i) => ({ ...b, order_id: i + 1 })) : [blankBlock()]);
    }
    aiTags.current = [];
    aiSourceUrls.current = [];
    ai.reset();
    setLeadApplied(false);
  }, [ai, editor]);

  /** Keep the AI draft safe as a version, then empty the editable fields for a fresh start. */
  const writeMyOwn = useCallback(() => {
    if (ai.keys.size > 0 && !versions.hasAiNow()) versions.save("ai", "AI draft", editor.currentPayload);
    editor.applyPayload({
      id: editor.currentArticleId || undefined,
      status: editor.status,
      slug: editor.slug,
      category: editor.category,
      author: { name: editor.authorName, role: editor.authorRole },
      body: [],
    });
    aiTags.current = [];
    aiSourceUrls.current = [];
    ai.reset();
    setLeadApplied(false);
  }, [ai, versions, editor]);

  return { leadApplied, applyLead, applyPaste, clearAiFields, writeMyOwn };
}
