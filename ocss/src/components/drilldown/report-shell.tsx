export function ReportSectionIntro({
  title,
}: {
  title: string
  countLabel?: string
  description?: string
  accent?: string
  soft?: string
}) {
  return (
    <div className="min-w-0">
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  )
}
