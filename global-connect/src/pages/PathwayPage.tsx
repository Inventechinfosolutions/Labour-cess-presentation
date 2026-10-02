import { Link, useParams } from "react-router";
import { ArrowLeft } from "@phosphor-icons/react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { PATHWAY_BY_ID, type PathwayId } from "@/lib/pathways";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function PathwayPage() {
  const { pathway } = useParams();
  const p = pathway ? PATHWAY_BY_ID[pathway as PathwayId] : undefined;
  if (!p) return <NotFoundPage />;
  const Icon = p.icon;

  return (
    <>
      <SiteHeader solid />
      <main className="flex min-h-[80dvh] items-center justify-center px-5 pt-[72px]">
        <div className="flex max-w-lg flex-col items-center text-center">
          <span
            className="grid size-20 place-items-center rounded-full text-white shadow-lg"
            style={{ background: `linear-gradient(145deg, ${p.color}, ${p.deep})` }}
          >
            <Icon size={38} weight="duotone" />
          </span>
          <h1 className="mt-6 font-display text-[34px] font-bold text-(color:--gc-ink)">{p.page}</h1>
          <p className="mt-2 text-[16px] text-(color:--gc-body)">{p.text}</p>
          <p className="mt-6 rounded-full bg-[#eef3fa] px-4 py-1.5 text-[13px] text-(color:--gc-body)">This page is being designed.</p>
          <Link to="/global-connect" className="mt-8 inline-flex items-center gap-2 font-medium" style={{ color: p.color }}>
            <ArrowLeft size={16} weight="bold" /> Back to Global Karnataka
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
