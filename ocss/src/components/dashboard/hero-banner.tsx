import { userMeta } from "@/data/dashboard-data"
import { KarnatakaDistrictMap } from "@/components/dashboard/karnataka-map"

export function HeroBanner() {
  return (
    <section className="stagger-in flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Good afternoon, <span className="text-gradient-cyan">{userMeta.name}</span> 👋
        </h1>
      </div>

      <div className="relative w-[88px] shrink-0 sm:w-[110px]">
        <KarnatakaDistrictMap compact className="w-full" selected="Bangalore" />
        <p className="pointer-events-none absolute -right-1 top-0 font-display text-[9px] font-semibold tracking-[0.28em] text-cyan/60 sm:text-[10px]">
          KA
        </p>
      </div>
    </section>
  )
}
