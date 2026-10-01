import { Link } from "react-router";
import emblem from "@/assets/karnataka-emblem.png";
import { PATHWAYS, pathwayHref } from "@/lib/pathways";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-[#061536] px-5 py-10 text-white/75 lg:px-8">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-white">
            <img src={emblem} alt="" className="h-8 w-auto" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[14px] font-semibold text-white">Karnataka Global Connect</span>
            <span className="block text-[12px]">People • Partnerships • Opportunities</span>
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]" aria-label="Footer">
          {PATHWAYS.map((p) => (
            <Link key={p.id} to={pathwayHref(p.id)} className="hover:text-white">
              {p.nav}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
