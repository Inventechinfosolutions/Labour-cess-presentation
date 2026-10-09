import { Bell, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const notices = [
  {
    id: "1",
    tag: "Circular",
    date: "15 May 2026",
    title: "Revised tariff structure for government guest houses",
    summary:
      "Updated room rates effective 1 June 2026 across all managed facilities. Review the new fee schedule before booking.",
    featured: true,
  },
  {
    id: "2",
    tag: "Advisory",
    date: "8 May 2026",
    title: "Digital check-in mandatory at all locations",
    summary:
      "Physical register entries are being phased out. Complete QR-based check-in through the portal on arrival.",
  },
  {
    id: "3",
    tag: "Notice",
    date: "28 Apr 2026",
    title: "Bengaluru Guest House — Block C renovation",
    summary:
      "Rooms on floors 2–3 unavailable until 30 June 2026. Alternative rooms available in Blocks A and B.",
  },
  {
    id: "4",
    tag: "Update",
    date: "12 Apr 2026",
    title: "Belagavi facility — extended booking window",
    summary:
      "Book Belagavi Guest House rooms up to 60 days in advance for official duty travel, subject to availability.",
  },
]

function tagStyles(tag: string) {
  switch (tag) {
    case "Circular":
      return "bg-primary/10 text-primary"
    case "Advisory":
      return "bg-amber-100 text-amber-800"
    case "Notice":
      return "bg-sky-100 text-sky-800"
    default:
      return "bg-emerald-100 text-emerald-800"
  }
}

export function LandingNotices() {
  const [featured, ...rest] = notices

  return (
    <section id="notices" className="border-t border-border/50 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-16 xl:gap-20">
          <div className="notice-header lg:sticky lg:top-28 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-[#fafafa] px-4 py-2">
              <Bell className="size-4 text-primary" strokeWidth={2.25} />
              <span className="text-sm font-medium text-[#222222]">Announcements</span>
            </div>
            <h2 className="mt-5 text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] text-[#222222] sm:text-[2.75rem]">
              Stay in the loop
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#717171] sm:text-[17px]">
              Official circulars, facility updates, and policy changes for government
              guest house accommodation.
            </p>
          </div>

          <div className="space-y-4">
            {featured && (
              <article className="notice-item group rounded-2xl border border-border/50 bg-[#fafafa] p-6 transition hover:border-border hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      tagStyles(featured.tag),
                    )}
                  >
                    {featured.tag}
                  </span>
                  <span className="rounded-full bg-[#222222] px-2.5 py-0.5 text-xs font-medium text-white">
                    Featured
                  </span>
                  <span className="text-xs text-[#717171]">{featured.date}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-snug text-[#222222] sm:text-[1.35rem]">
                  {featured.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#717171]">{featured.summary}</p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#222222] transition group-hover:gap-2"
                >
                  Read full circular
                  <ChevronRight className="size-4" />
                </button>
              </article>
            )}

            <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/50 bg-[#fafafa]">
              {rest.map((notice) => (
                <article
                  key={notice.id}
                  className="notice-item group flex cursor-default gap-4 p-5 transition hover:bg-white sm:p-6"
                >
                  <div className="hidden w-20 shrink-0 pt-0.5 sm:block">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#717171]">
                      {notice.date.split(" ").slice(1).join(" ")}
                    </p>
                    <p className="text-lg font-semibold text-[#222222]">
                      {notice.date.split(" ")[0]}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:hidden">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          tagStyles(notice.tag),
                        )}
                      >
                        {notice.tag}
                      </span>
                      <span className="text-xs text-[#717171]">{notice.date}</span>
                    </div>
                    <span
                      className={cn(
                        "hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-flex",
                        tagStyles(notice.tag),
                      )}
                    >
                      {notice.tag}
                    </span>
                    <h3 className="mt-2 font-semibold leading-snug text-[#222222] group-hover:underline sm:mt-1.5">
                      {notice.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#717171]">
                      {notice.summary}
                    </p>
                  </div>

                  <ChevronRight className="mt-1 size-5 shrink-0 text-[#717171] opacity-0 transition group-hover:opacity-100" />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
