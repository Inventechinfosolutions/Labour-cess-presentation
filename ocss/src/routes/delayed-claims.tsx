import { useState, type FormEvent, type ReactNode } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  FileText,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  PageHero,
  PageShell,
  SectionCard,
} from "@/components/drilldown/page-shell"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/delayed-claims")({
  component: DelayedClaimsPage,
})

const competentAuthorities = [
  "Competent Authority, Bengaluru",
  "Competent Authority, Mysuru",
  "Competent Authority, Belagavi",
  "Competent Authority, Kalaburagi",
]

const financialEstablishments = [
  "IMA Jewels",
  "IMA Healthcare",
  "Redington India",
  "Lancer Finance",
  "Other fraudulent entity",
]

type FieldProps = {
  label: string
  name: string
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
}

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  required,
  className,
}: FieldProps) {
  return (
    <label className={cn("grid min-w-0 gap-1.5", className)}>
      <span className="text-xs font-medium text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </span>
      <Input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-9 rounded-md bg-background"
      />
    </label>
  )
}

function SelectField({
  label,
  name,
  placeholder,
  options,
  required,
  className,
}: {
  label: string
  name: string
  placeholder: string
  options: string[]
  required?: boolean
  className?: string
}) {
  return (
    <label className={cn("grid min-w-0 gap-1.5", className)}>
      <span className="text-xs font-medium text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20 dark:bg-input/30"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function FileField({
  label,
  name,
  accept = "image/*,.pdf",
}: {
  label: string
  name: string
  accept?: string
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <span className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 dark:bg-input/30">
        <Upload className="size-3.5" />
        <span>Choose file</span>
        <input name={name} type="file" accept={accept} className="sr-only" />
      </span>
    </label>
  )
}

function FormSection({
  number,
  title,
  children,
}: {
  number?: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-md border border-black/[0.05] bg-muted/20 dark:border-white/[0.08] dark:bg-white/[0.025]">
      <div className="flex items-center gap-3 border-b border-border/60 bg-background/70 px-4 py-3 dark:bg-white/[0.025] sm:px-5">
        {number != null ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            {number}
          </span>
        ) : null}
        <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">{children}</div>
    </section>
  )
}

function DepositTransactionTable({ prefix }: { prefix: string }) {
  return (
    <div className="sm:col-span-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-1 text-left">
          <thead>
            <tr className="text-[10px] font-semibold text-muted-foreground uppercase">
              <th className="w-10 px-1.5 py-1">Sl. No.</th>
              <th className="w-32 px-1.5 py-1">Date</th>
              <th className="px-1.5 py-1">Deposit (Rs)</th>
              <th className="px-1.5 py-1">
                CASH / NEFT / RTGS / IMPS / Cheque No.
              </th>
              <th className="px-1.5 py-1">Total Deposit (Rs)</th>
              <th className="px-1.5 py-1">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, index) => (
              <tr key={index}>
                <td className="px-1.5 text-center text-xs text-muted-foreground">
                  {index + 1}
                </td>
                <td className="px-1">
                  <Input
                    name={`${prefix}Date${index + 1}`}
                    type="date"
                    aria-label={`Transaction ${index + 1} date`}
                    className="h-8 rounded-md bg-background text-xs"
                  />
                </td>
                <td className="px-1">
                  <Input
                    name={`${prefix}Deposit${index + 1}`}
                    type="number"
                    min="0"
                    placeholder="Amount"
                    aria-label={`Transaction ${index + 1} deposit`}
                    className="h-8 rounded-md bg-background text-xs"
                  />
                </td>
                <td className="px-1">
                  <Input
                    name={`${prefix}Reference${index + 1}`}
                    placeholder="Reference / cheque no."
                    aria-label={`Transaction ${index + 1} reference`}
                    className="h-8 rounded-md bg-background text-xs"
                  />
                </td>
                <td className="px-1">
                  <Input
                    name={`${prefix}Total${index + 1}`}
                    type="number"
                    min="0"
                    placeholder="Total"
                    aria-label={`Transaction ${index + 1} total`}
                    className="h-8 rounded-md bg-background text-xs"
                  />
                </td>
                <td className="px-1">
                  <Input
                    name={`${prefix}Remarks${index + 1}`}
                    placeholder="Remarks"
                    aria-label={`Transaction ${index + 1} remarks`}
                    className="h-8 rounded-md bg-background text-xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ApplicantInstructions({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="!fixed !top-1/2 !left-1/2 flex max-h-[90svh] !w-[calc(100vw-2rem)] !max-w-[960px] -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-2xl border border-border/70 bg-background p-0 text-foreground shadow-2xl sm:!max-w-[960px] lg:!left-[calc((100vw+var(--app-sidebar-width))/2)] lg:!w-[calc(100vw-var(--app-sidebar-width)-2rem)]"
      >
        <DialogHeader className="shrink-0 border-b border-border/70 px-5 py-4 sm:px-7">
          <DialogTitle className="pr-8 text-base font-bold tracking-wide text-foreground uppercase sm:text-lg">
            Instructions to applicants
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-[13px] leading-relaxed text-foreground sm:px-7 sm:py-6 sm:text-sm">
          <div className="space-y-4">
            <p>
              <strong>FORM:</strong> For manual submission, the applicant must
              produce depositor identity proof (Aadhaar, PAN, or Driving Licence),
              the bond or agreement with the fraudulent entity, and a Power of
              Attorney where an authorised agent is filing the claim. The mobile
              number and full postal address with PIN code of the depositor,
              nominee, or Power of Attorney holder must be entered in the Form
              Issue Register along with the serial number and unique form number.
            </p>
            <p>
              <strong>TOKEN:</strong> When submitting the claim, obtain a token
              showing the counter number, serial number, and reporting time, and
              sign the Token Register. The unique form number on the token will
              be used for digitisation, tracking, queries, and communication.
            </p>
            <p>
              <strong>SUBMISSION:</strong> Present the token counterfoil when
              called by the concerned counter and submit it with all claim
              documents. A token cannot be carried forward to another date unless
              it is signed and returned by the counter clerk. After examination,
              an acknowledgement stating whether the claim is accepted, rejected,
              or requires additional documents will be issued. The claimant must
              sign the acknowledgement and retain their copy.
            </p>
            <p>
              <strong>SIGNATURE:</strong> Documents must be signed by the
              depositor. For a minor or deceased depositor, the parent, guardian,
              nominee, legal heir, or duly authorised Power of Attorney holder
              may sign, as applicable.
            </p>
            <p>
              <strong>PRODUCING DOCUMENTS:</strong> Bonds, agreements, notarised
              affidavits, and statutory documents must be produced in original.
              Where copies are permitted, submit clear, signed, and attested
              photocopies of every page, or produce the original with a photocopy
              for attestation by the concerned officer. Scanned or WhatsApp
              copies are not accepted.
            </p>
            <p>
              <strong>NUMBER OF CLAIMS:</strong> A separate claim must be
              submitted for each Customer or Client ID shown in the bond or
              agreement. Multiple, bundled, family, or group claims cannot be
              submitted under one token.
            </p>

            <div>
              <p className="font-semibold">NOTE 1: Special procedure</p>
              <p className="mt-2">
                Claim applications will ordinarily be received on a first-come,
                first-served basis. Priority may be given in the following order:
              </p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                <li>Senior citizens aged 60 years and above.</li>
                <li>Women carrying an infant.</li>
                <li>Persons with disabilities or infirmity.</li>
                <li>Women applicants.</li>
                <li>
                  Medically unfit applicants with a recent medical certificate.
                </li>
              </ol>
              <p className="mt-3">
                Claims should be submitted by the depositor. The following
                persons may submit a claim where the depositor cannot do so:
              </p>
              <ol className="mt-1 list-[lower-roman] space-y-0.5 pl-5">
                <li>
                  A nominee, legal heir, spouse, parent, or child due to the
                  depositor’s illness, disability, or death.
                </li>
                <li>
                  An extended family member where the immediate family is
                  unavailable, subject to an authorisation or death certificate,
                  as applicable.
                </li>
                <li>A parent or legal guardian on behalf of a minor.</li>
                <li>
                  A Power of Attorney holder duly authorised for this purpose.
                </li>
              </ol>
            </div>

            <div>
              <p className="font-semibold">
                NOTE 2: Filing by nominee, legal heir, or Power of Attorney
                holder
              </p>
              <p className="mt-2">
                A depositor or nominee who is outside the State or country,
                hospitalised, medically infirm, or otherwise unable to file may
                submit the claim through a legal heir or Power of Attorney holder.
                The representative must provide valid identity and authority
                documents. In the case of a deceased depositor, a death
                certificate, family tree issued by the competent authority, and
                consent from other legal heirs must be produced wherever
                applicable.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t border-border/70 bg-background px-5 py-4 sm:justify-end sm:px-7">
          <DialogClose render={<Button className="min-w-28 shadow-sm" />}>
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DelayedClaimForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [step, setStep] = useState<1 | 2>(1)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmitted()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <SectionCard className="stagger-in">
      <nav
        aria-label="Delayed claim steps"
        className="mb-5 grid gap-2 border-b border-border/60 pb-5 sm:grid-cols-2"
      >
        <button
          type="button"
          onClick={() => setStep(1)}
          aria-current={step === 1 ? "step" : undefined}
          className={cn(
            "group flex min-w-0 items-center gap-3 rounded-md border p-3 text-left transition-colors",
            step === 1
              ? "border-primary/35 bg-primary/[0.06]"
              : "border-border/70 bg-muted/20 hover:bg-muted/40",
          )}
        >
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
              step === 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            1
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
              Step 1
            </span>
            <span className="block truncate text-sm font-semibold text-foreground">
              Applicant details
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStep(2)}
          aria-current={step === 2 ? "step" : undefined}
          className={cn(
            "group flex min-w-0 items-center gap-3 rounded-md border p-3 text-left transition-colors",
            step === 2
              ? "border-primary/35 bg-primary/[0.06]"
              : "border-border/70 bg-muted/20 hover:bg-muted/40",
          )}
        >
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
              step === 2
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            2
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
              Step 2
            </span>
            <span className="block truncate text-sm font-semibold text-foreground">
              Statement of investment
            </span>
          </span>
        </button>
      </nav>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            <section className="grid gap-4 rounded-md bg-muted/20 p-4 sm:grid-cols-2">
              <FormField
                label="Serial Number"
                name="serialNumber"
                placeholder="Enter serial number"
              />
              <FormField
                label="Def. C.A. CLNO"
                name="defCaClno"
                placeholder="Enter Def. C.A. CLNO"
              />
              <SelectField
                label="Competent Authority"
                name="competentAuthority"
                placeholder="Select Competent Authority"
                options={competentAuthorities}
                required
              />
              <SelectField
                label="Financial Establishment"
                name="financialEstablishment"
                placeholder="Select Financial Establishment"
                options={financialEstablishments}
                required
              />
              <FormField
                label="Claim Application Number"
                name="claimApplicationNumber"
                placeholder="Enter claim application number"
              />
              <FormField
                label="Date of Claim"
                name="dateOfClaim"
                type="date"
                required
              />
            </section>

            <FormSection number={1} title="Applicant details">
              <FormField
                label="Name of the applicant"
                name="applicantName"
                required
                placeholder="Full name"
              />
              <FormField
                label="Father / Husband name"
                name="fatherOrHusbandName"
                placeholder="Enter name"
              />
              <FormField
                label="Customer / Client ID"
                name="customerId"
                placeholder="Enter customer ID"
              />
              <label className="grid min-w-0 gap-1.5 sm:col-span-2">
                <span className="text-xs font-medium text-foreground">
                  Correspondence address
                  <span className="ml-0.5 text-destructive">*</span>
                </span>
                <Textarea
                  name="address"
                  required
                  placeholder="Enter full postal address with PIN code"
                  className="min-h-20 rounded-md bg-background"
                />
              </label>
              <FormField label="Date of birth" name="dob" type="date" />
              <FormField
                label="Age"
                name="age"
                type="number"
                placeholder="Age"
              />
              <FormField
                label="Mobile number"
                name="mobile"
                required
                placeholder="10-digit mobile"
              />
              <FormField
                label="Alternate mobile"
                name="altMobile"
                placeholder="Optional"
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className="sm:col-span-2"
              />
              <FormField
                label="Aadhaar / Passport / DL No."
                name="idNumber"
                placeholder="Enter ID number"
              />
              <FileField label="Upload ID proof" name="idProof" />
              <FormField
                label="PAN number"
                name="pan"
                placeholder="ABCDE1234F"
              />
              <FileField label="Upload PAN" name="panProof" />
              <FormField
                label="Delay condonation order No. & date"
                name="condonationOrder"
                placeholder="Order number and date"
                className="sm:col-span-2"
              />
              <FileField
                label="Upload delay condonation order"
                name="condonationOrderFile"
              />
            </FormSection>

            <FormSection number={2} title="Nominee details (if applicable)">
              <FormField
                label="Nominee name"
                name="nomineeName"
                placeholder="Enter nominee name"
              />
              <FormField
                label="Gender & age"
                name="nomineeGenderAge"
                placeholder="e.g. Female, 42"
              />
              <FormField
                label="Relationship"
                name="nomineeRelationship"
                placeholder="Relationship"
              />
              <FormField
                label="Nominee ID proof No."
                name="nomineeId"
                placeholder="Enter ID number"
              />
              <FileField
                label="Upload nominee ID proof"
                name="nomineeIdProof"
              />
            </FormSection>

            <FormSection number={3} title="Statement of investment">
              <FormField
                label="Type of the scheme"
                name="schemeType"
                required
                placeholder="Scheme type"
              />
              <FormField
                label="Name of the scheme"
                name="schemeName"
                required
                placeholder="Scheme name"
              />
            </FormSection>

            <FormSection number={4} title="Depositor bank details">
              <FormField
                label="Bank account No."
                name="depositorAccount"
                required
                placeholder="Account number"
              />
              <FormField
                label="IFSC code"
                name="depositorIfsc"
                required
                placeholder="IFSC"
              />
              <FormField
                label="Bank name"
                name="depositorBank"
                required
                placeholder="Bank name"
              />
              <FormField
                label="Branch name"
                name="depositorBranch"
                placeholder="Branch name"
              />
            </FormSection>

            <FormSection number={5} title="Bank details for refund">
              <FormField
                label="Bank account No."
                name="refundAccount"
                required
                placeholder="Account number"
              />
              <FormField
                label="IFSC code"
                name="refundIfsc"
                required
                placeholder="IFSC"
              />
              <FormField
                label="Bank name"
                name="refundBank"
                required
                placeholder="Bank name"
              />
              <FormField
                label="Branch name"
                name="refundBranch"
                placeholder="Branch name"
              />
            </FormSection>

            <FormSection number={6} title="Total amount due">
              <FormField
                label="Amount (in figures)"
                name="amountFigures"
                type="number"
                required
                placeholder="0.00"
              />
              <FormField
                label="Amount (in words)"
                name="amountWords"
                required
                placeholder="Amount in words"
              />
            </FormSection>

            <FormSection number={7} title="Declaration">
              <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  name="declaration"
                  required
                  className="mt-0.5 size-4.5 rounded border-input accent-primary"
                />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  I hereby declare that the particulars furnished above are true
                  and correct to the best of my knowledge, and I undertake to
                  abide by the orders of the Competent Authority under the KPID
                  Act.
                </span>
              </label>
              <FormField
                label="Place"
                name="place"
                required
                placeholder="Place"
              />
              <FormField
                label="Date"
                name="declarationDate"
                type="date"
                required
              />
              <FileField label="Signature upload" name="signature" />
            </FormSection>

            <div className="flex justify-end border-t border-border/60 pt-4">
              <Button type="button" onClick={() => setStep(2)}>
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <FormSection number={1} title="Statement of investment">
              <FormField
                label="Financial Establishment"
                name="investmentFinancialEstablishment"
                required
                placeholder="M/s. Lancer Finance Company"
              />
              <FormField
                label="Del_CA_CLNO"
                name="delCaClno"
                placeholder="Enter Del_CA_CLNO"
              />
              <FormField
                label="Customer / Client ID"
                name="investmentCustomerId"
                placeholder="Enter customer or client ID"
              />
              <label className="grid min-w-0 gap-1.5">
                <span className="text-xs font-medium text-foreground">
                  Remarks
                </span>
                <Textarea
                  name="investmentRemarks"
                  placeholder="Enter remarks"
                  className="min-h-20 rounded-md bg-background"
                />
              </label>
              <SelectField
                label="PARTICULARS (CASH / NEFT / RTGS / IMPS OR CHEQUE)"
                name="paymentParticulars"
                placeholder="Select payment mode"
                options={["Cash", "NEFT", "RTGS", "IMPS", "Cheque"]}
                required
              />
              <FormField
                label="NAME OF THE SCHEME"
                name="investmentSchemeName"
                required
                placeholder="Enter scheme name"
              />
            </FormSection>

            <FormSection number={2} title="Depositor bank details">
              <FormField
                label="Bank Account No."
                name="stepTwoDepositorAccount"
                required
                placeholder="Enter account number"
              />
              <FormField
                label="IFSC code"
                name="stepTwoDepositorIfsc"
                required
                placeholder="Enter IFSC code"
              />
              <FormField
                label="Bank name"
                name="stepTwoDepositorBank"
                placeholder="Enter bank name"
              />
              <FormField
                label="Branch name"
                name="stepTwoDepositorBranch"
                placeholder="Enter branch name"
              />
              <DepositTransactionTable prefix="depositorTransaction" />
            </FormSection>

            <FormSection number={3} title="F.E. Bank Details">
              <FormField
                label="Bank Account No."
                name="entityBankAccount"
                placeholder="Enter account number"
              />
              <FormField
                label="IFSC code"
                name="entityBankIfsc"
                placeholder="Enter IFSC code"
              />
              <FormField
                label="Bank name"
                name="entityBankName"
                placeholder="Enter bank name"
              />
              <FormField
                label="Branch name"
                name="entityBankBranch"
                placeholder="Enter branch name"
              />
              <DepositTransactionTable prefix="entityTransaction" />
            </FormSection>

            <section className="grid gap-4 rounded-md border border-black/[0.05] bg-muted/20 p-4 dark:border-white/[0.08] dark:bg-white/[0.025] sm:grid-cols-2">
              <p className="border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground sm:col-span-2">
                <span className="font-semibold text-foreground">Note:</span> FE
                is Financial Enterprise. Please ensure Account Number, IFSC Code
                and amounts written for Deposit and Receipt are correct as it
                will be cross verified. False information is punishable.
              </p>
              <FormField
                label="Place"
                name="investmentDeclarationPlace"
                placeholder="Enter place"
              />
              <FormField
                label="Date"
                name="investmentDeclarationDate"
                type="date"
              />
              <FileField
                label="Signature Upload"
                name="investmentSignature"
                accept="image/*"
              />
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button type="submit">Register Claim</Button>
            </div>
          </>
        )}
      </form>
    </SectionCard>
  )
}

function DelayedClaimsPage() {
  const [instructionsOpen, setInstructionsOpen] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="Claim settlement"
        title="Delayed claims"
        description="File a delayed claim application under 7(2) of the KPID Act."
        icon={Clock3}
        backTo="/"
        backLabel="Back to overview"
        accent="#2563eb"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setInstructionsOpen(true)}
          >
            <FileText />
            View instructions
          </Button>
        }
      />

      <ApplicantInstructions
        open={instructionsOpen}
        onOpenChange={setInstructionsOpen}
      />

      {submitted ? (
        <SectionCard className="stagger-in">
          <section className="rounded-md border border-success/25 bg-success/5 p-8 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-success text-white">
              <Check className="size-5" />
            </span>
            <h2 className="mt-3 font-display text-lg font-semibold">
              Delayed claim submitted
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The delayed claim application has been recorded for verification.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button onClick={() => setSubmitted(false)}>
                File another delayed claim
              </Button>
            </div>
          </section>
        </SectionCard>
      ) : (
        <DelayedClaimForm onSubmitted={() => setSubmitted(true)} />
      )}
    </PageShell>
  )
}
