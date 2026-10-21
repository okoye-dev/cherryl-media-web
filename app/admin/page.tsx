"use client";

import { useState } from "react";
import { SITE } from "@/config/site";
import { Btn, PageTitle } from "@/components/admin/ui";
import QuickPublishSheet from "@/components/admin/dashboard/QuickPublishSheet";
import StatsRow from "@/components/admin/dashboard/StatsRow";
import LeadsPanel from "@/components/admin/dashboard/LeadsPanel";
import StoriesPanel from "@/components/admin/dashboard/StoriesPanel";
import { useStories } from "@/hooks/dashboard/useStories";
import { useLeads } from "@/hooks/dashboard/useLeads";
import { leadToArticle } from "@/lib/leadToArticle";
import type { CanonicalArticle } from "@/lib/types";
import type { StoryLead } from "@/lib/leads";

type QuickPublish = { draft: Partial<CanonicalArticle>; editHref: string; from: "lead" | "draft"; leadId?: string };

export default function AdminDashboardPage() {
  const [reload, setReload] = useState(0);
  const [quick, setQuick] = useState<QuickPublish | null>(null);
  const stories = useStories(reload);
  const leads = useLeads(reload);

  const quickPublishLead = (c: StoryLead) =>
    setQuick({
      draft: leadToArticle(c.raw || { headline: c.title, pitch: c.pitch }),
      editHref: `/admin/editor?candidate=${encodeURIComponent(c.id)}`,
      from: "lead",
      leadId: c.id,
    });

  const quickPublishDraft = (a: CanonicalArticle) =>
    setQuick({ draft: a, editHref: `/admin/editor?slug=${encodeURIComponent(a.slug)}`, from: "draft" });

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageTitle
        title="Stories"
        actions={
          <Btn href="/admin/editor" variant="primary" block>
            Write story
          </Btn>
        }
      />

      <StatsRow
        stats={[
          { label: "Published", value: stories.counts.published, tone: "text-emerald-400" },
          { label: "Drafts", value: stories.counts.draft, tone: "text-amber-400" },
          { label: "Categories", value: SITE.categories.length, tone: "text-white" },
          { label: "Leads", value: leads.info.total, tone: "text-violet-300" },
        ]}
      />

      <LeadsPanel
        leads={leads.leads}
        busy={leads.busy}
        page={leads.page}
        info={leads.info}
        onPage={leads.setPage}
        onQuickPublish={quickPublishLead}
      />

      <StoriesPanel
        articles={stories.articles}
        busy={stories.busy}
        filter={stories.filter}
        onFilter={stories.setFilter}
        counts={stories.counts}
        page={stories.page}
        info={stories.info}
        onPage={stories.setPage}
        onQuickPublish={quickPublishDraft}
      />

      {quick && (
        <QuickPublishSheet
          draft={quick.draft}
          editHref={quick.editHref}
          from={quick.from}
          onClose={() => setQuick(null)}
          onPublished={() => setReload((n) => n + 1)}
        />
      )}
    </div>
  );
}
