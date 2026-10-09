import type { Opportunity } from "@/lib/types";

/**
 * Read-only land / location copy for IPP opportunity views (list + detail).
 */
export function formatOpportunityLandAddressReadOnly(o: Opportunity): string {
  if (o.locationType === "Fixed") {
    const site = o.fixedSiteAddress?.trim();
    const region = [o.district, o.state].filter(Boolean).join(", ");
    if (site && region) return `${site}\nRegion: ${region}`;
    if (site) return site;
    if (region) return `Fixed site (region): ${region}`;
    return "Fixed site — address on file with nodal agency.";
  }

  const lines: string[] = [];
  if (o.locationAddress?.trim()) {
    lines.push(o.locationAddress.trim());
  }
  if (o.landSource === "Department Provided") {
    const ref =
      o.departmentFixedLocationSummary?.trim() ||
      [o.district, o.state].filter(Boolean).join(" · ");
    if (ref) {
      lines.push(`Department / nodal reference: ${ref}`);
    }
  } else {
    lines.push("IPP-provided land — you propose the project site within the eligible region.");
    if (o.state || o.district) {
      lines.push(`Eligible region: ${[o.district, o.state].filter(Boolean).join(", ")}`);
    }
  }
  return lines.join("\n\n");
}

export function opportunityLandSearchBlob(o: Opportunity): string {
  return [
    o.fixedSiteAddress,
    o.locationAddress,
    o.departmentFixedLocationSummary,
    o.state,
    o.district,
  ]
    .filter(Boolean)
    .join(" ");
}
