import { useState, type FormEvent } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  Check,
  Eye,
  FileCheck2,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageShell, SectionCard } from "@/components/drilldown/page-shell"

export const Route = createFileRoute("/assessment")({
  component: AssessmentPage,
})

type AssessmentRow = {
  field: string
  value: string
  document?: string
  group?: string
}

type AssessmentSectionData = {
  number: number
  title: string
  rows: AssessmentRow[]
}

const assessmentSections: AssessmentSectionData[] = [
  {
    number: 1,
    title: "Claimant details",
    rows: [
      {
        field: "Name of Claimant / Depositor",
        value: "Ayesha Banu",
        document: "Claim application",
      },
      {
        field: "Father / Husband Name",
        value: "Mohammed Ismail",
        document: "Identity proof",
      },
      {
        field: "Date of Birth & Age",
        value: "18 June 1978 · 48 years",
        document: "Aadhaar card",
      },
    ],
  },
  {
    number: 2,
    title: "Contact details",
    rows: [
      {
        field: "Correspondence Address",
        value: "Frazer Town, Bengaluru, Karnataka 560005",
        document: "Address proof",
      },
      {
        field: "Mobile Number",
        value: "+91 98450 12847",
        document: "Claim application",
      },
      {
        field: "Email Address",
        value: "ayesha.banu@example.com",
        document: "Claim application",
      },
    ],
  },
  {
    number: 3,
    title: "Identity and document verification",
    rows: [
      {
        field: "Aadhaar / Passport / Driving Licence No.",
        value: "XXXX XXXX 4821",
        document: "Aadhaar.pdf",
      },
      {
        field: "PAN",
        value: "ABCDE1234F",
        document: "PAN.pdf",
      },
      {
        field: "Customer / Client ID",
        value: "IMA-CL-10482",
        document: "Bond / agreement",
      },
    ],
  },
  {
    number: 4,
    title: "Financial documents",
    rows: [
      {
        field: "Bond / Agreement",
        value: "Original produced",
        document: "Bond agreement.pdf",
      },
      {
        field: "Deposit Receipts",
        value: "5 receipts · ₹4,80,000",
        document: "Deposit receipts.pdf",
      },
    ],
  },
  {
    number: 5,
    title: "Nominee details (if applicable)",
    rows: [
      {
        field: "Nominee Name",
        value: "Mohammed Arif",
        document: "Nomination form",
      },
      {
        field: "Gender & Age",
        value: "Male · 29 years",
        document: "Nominee ID proof",
      },
      {
        field: "Relationship with Depositor",
        value: "Son",
        document: "Family certificate",
      },
      {
        field: "ID Proof of Nominee",
        value: "XXXX XXXX 7210",
        document: "Nominee Aadhaar.pdf",
      },
      {
        field: "Proof of Nomination",
        value: "Nominee recorded in agreement",
        document: "Nomination proof.pdf",
      },
      {
        field: "Death Certificate (if applicable)",
        value: "Not applicable",
      },
      {
        field: "Family Tree / Legal Heir Certificate",
        value: "Not applicable",
      },
      {
        field: "Power of Attorney / Authorisation",
        value: "Not applicable",
      },
    ],
  },
  {
    number: 6,
    title: "Bank account details",
    rows: [
      {
        group: "Bank account corresponding to the claimant / depositor",
        field: "Bank Account No.",
        value: "XXXXXX4182",
        document: "Bank passbook.pdf",
      },
      {
        field: "Bank Name",
        value: "State Bank of India",
        document: "Bank passbook.pdf",
      },
      {
        field: "Branch Name",
        value: "Frazer Town, Bengaluru",
        document: "Bank passbook.pdf",
      },
      {
        field: "IFSC Code",
        value: "SBIN0004821",
        document: "Bank passbook.pdf",
      },
      {
        group: "Bank account in which the claimant seeks refund",
        field: "Bank Account No.",
        value: "XXXXXX4182",
        document: "Cancelled cheque.pdf",
      },
      {
        field: "Bank Name",
        value: "State Bank of India",
        document: "Cancelled cheque.pdf",
      },
      {
        field: "Branch Name",
        value: "Frazer Town, Bengaluru",
        document: "Cancelled cheque.pdf",
      },
      {
        field: "IFSC Code",
        value: "SBIN0004821",
        document: "Cancelled cheque.pdf",
      },
      {
        field: "Passbook Document",
        value: "Submitted",
        document: "Refund bank passbook.pdf",
      },
    ],
  },
  {
    number: 7,
    title: "Scheme details and claim",
    rows: [
      {
        field: "Type & Name of Scheme",
        value: "Investment scheme · Monthly return plan",
        document: "Scheme certificate.pdf",
      },
      {
        field: "Financial Establishment & Total Amount Due",
        value: "IMA Jewels · ₹6,35,400",
        document: "Claim calculation.pdf",
      },
    ],
  },
]

function VerificationOptions({
  section,
  row,
}: {
  section: number
  row: number
}) {
  const name = `verification-${section}-${row}`

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {["Verified", "Mismatch", "N/A"].map((option) => (
        <label
          key={option}
          className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          <input
            type="radio"
            name={name}
            value={option}
            defaultChecked={option === "Verified"}
            className="size-3.5 accent-primary"
          />
          {option}
        </label>
      ))}
    </div>
  )
}

function AssessmentSection({
  section,
  onPreviewDocument,
}: {
  section: AssessmentSectionData
  onPreviewDocument: (document: string) => void
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-xs">
      <header className="flex items-center gap-3 border-b border-border/70 bg-muted/35 px-4 py-3 sm:px-5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          {section.number}
        </span>
        <h2 className="font-display text-sm font-semibold text-foreground">
          {section.title}
        </h2>
      </header>

      <div className="hidden grid-cols-[1.1fr_1fr_1fr_1.1fr_1fr] border-b border-border/60 bg-muted/15 px-4 py-2 text-[10px] font-bold tracking-wide text-muted-foreground uppercase md:grid sm:px-5">
        <span>Field name</span>
        <span>Submitted data</span>
        <span>Uploaded document</span>
        <span>Verification</span>
        <span>Remarks</span>
      </div>

      <div className="divide-y divide-border/60">
        {section.rows.map((row, rowIndex) => (
          <div key={`${row.group ?? ""}-${row.field}`} className="contents">
            {row.group ? (
              <div className="bg-primary/[0.05] px-4 py-2 text-[11px] font-semibold text-primary sm:px-5">
                {row.group}
              </div>
            ) : null}
            <div className="grid gap-3 px-4 py-3 md:grid-cols-[1.1fr_1fr_1fr_1.1fr_1fr] md:items-center sm:px-5">
              <div>
                <span className="mb-1 block text-[10px] font-bold tracking-wide text-muted-foreground uppercase md:hidden">
                  Field name
                </span>
                <p className="text-xs font-semibold text-foreground">
                  {row.field}
                </p>
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-bold tracking-wide text-muted-foreground uppercase md:hidden">
                  Submitted data
                </span>
                <p className="text-xs text-muted-foreground">{row.value}</p>
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-bold tracking-wide text-muted-foreground uppercase md:hidden">
                  Uploaded document
                </span>
                {row.document ? (
                  <button
                    type="button"
                    onClick={() => onPreviewDocument(row.document!)}
                    aria-label={`Preview ${row.document}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-primary/15 bg-primary/[0.05] px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Eye className="size-3.5" />
                    <span className="truncate">{row.document}</span>
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Not supplied
                  </span>
                )}
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-bold tracking-wide text-muted-foreground uppercase md:hidden">
                  Verification
                </span>
                <VerificationOptions section={section.number} row={rowIndex} />
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-bold tracking-wide text-muted-foreground uppercase md:hidden">
                  Remarks
                </span>
                <Input
                  name={`remarks-${section.number}-${rowIndex}`}
                  placeholder="Add remarks"
                  className="h-8 bg-background text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function AssessmentPage() {
  const [submitted, setSubmitted] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <PageShell className="space-y-4">
      {submitted ? (
        <SectionCard className="stagger-in">
          <div className="py-10 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-success text-white">
              <Check className="size-5" />
            </span>
            <h2 className="mt-3 font-display text-lg font-semibold text-foreground">
              Assessment submitted
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The claim assessment has been recorded for approval.
            </p>
            <Button className="mt-4" onClick={() => setSubmitted(false)}>
              Review assessment
            </Button>
          </div>
        </SectionCard>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <SectionCard className="stagger-in">
            <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
                Assessment of Claim Application Form Under 7(2) of KPID Act
              </h1>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye />
                Preview application
              </Button>
            </div>

            <div className="mt-4 grid gap-4 rounded-lg bg-muted/25 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-foreground">
                  Competent Authority
                </span>
                <Input defaultValue="Competent Authority, Bengaluru" />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-foreground">
                  Financial Establishment
                </span>
                <Input defaultValue="IMA Jewels" />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-foreground">
                  Claim Application No.
                </span>
                <Input defaultValue="CLAIM-2026-01482" />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-foreground">
                  Date of Application
                </span>
                <Input type="date" defaultValue="2026-07-16" />
              </label>
            </div>
          </SectionCard>

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Claim application preview</DialogTitle>
              </DialogHeader>

              <div className="grid gap-3 rounded-lg border border-border/70 bg-muted/20 p-4 sm:grid-cols-2">
                {[
                  ["Claim Application No.", "CLAIM-2026-01482"],
                  ["Date of Application", "16 July 2026"],
                  ["Claimant / Depositor", "Ayesha Banu"],
                  ["Customer / Client ID", "IMA-CL-10482"],
                  ["Competent Authority", "Competent Authority, Bengaluru"],
                  ["Financial Establishment", "IMA Jewels"],
                  ["Scheme", "Monthly return plan"],
                  ["Total Amount Due", "₹6,35,400"],
                  ["Refund Bank Account", "XXXXXX4182"],
                  ["IFSC Code", "SBIN0004821"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-border/60 bg-background p-3"
                  >
                    <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <section>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Submitted documents
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    "Claim application",
                    "Aadhaar.pdf",
                    "PAN.pdf",
                    "Bond agreement.pdf",
                    "Deposit receipts.pdf",
                    "Nomination proof.pdf",
                    "Cancelled cheque.pdf",
                    "Refund bank passbook.pdf",
                  ].map((document) => (
                    <div
                      key={document}
                      className="flex items-center gap-2 rounded-md border border-primary/15 bg-primary/[0.05] px-3 py-2 text-xs font-medium text-primary"
                    >
                      <FileCheck2 className="size-4" />
                      {document}
                    </div>
                  ))}
                </div>
              </section>
            </DialogContent>
          </Dialog>

          <Dialog
            open={documentPreview !== null}
            onOpenChange={(open) => {
              if (!open) setDocumentPreview(null)
            }}
          >
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{documentPreview}</DialogTitle>
              </DialogHeader>
              <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/25 p-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileCheck2 className="size-6" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  Document preview
                </h3>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  {documentPreview} submitted for claim CLAIM-2026-01482 by
                  Ayesha Banu.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {assessmentSections.map((section) => (
            <AssessmentSection
              key={section.number}
              section={section}
              onPreviewDocument={setDocumentPreview}
            />
          ))}

          <SectionCard className="sticky bottom-3 z-10">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Save draft
              </Button>
              <Button type="submit">
                <Save />
                Submit Assessment
              </Button>
            </div>
          </SectionCard>
        </form>
      )}
    </PageShell>
  )
}
