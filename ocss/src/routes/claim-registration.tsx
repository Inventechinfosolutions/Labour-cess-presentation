import { useState, type FormEvent, type ReactNode } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardPenLine,
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

export const Route = createFileRoute("/claim-registration")({
  component: ClaimRegistrationPage,
})

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
  number: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-md border border-black/[0.05] bg-muted/20 dark:border-white/[0.08] dark:bg-white/[0.025]">
      <div className="flex items-center gap-3 border-b border-border/60 bg-background/70 px-4 py-3 dark:bg-white/[0.025] sm:px-5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          {number}
        </span>
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

const establishmentOptions = [
  "IMA Jewels",
  "Lancer Finance",
  "Innovative Business Centre",
  "Surya Chits",
  "Riddhi Finance",
  "Other fraudulent entity",
]

function ApplicantInstructions({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [instructionsAccepted, setInstructionsAccepted] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen || instructionsAccepted) onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="!fixed !top-1/2 !left-1/2 flex max-h-[90svh] !w-[calc(100vw-2rem)] !max-w-[960px] -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-2xl border border-border/70 p-0 shadow-2xl sm:!max-w-[960px] lg:!left-[calc((100vw+var(--app-sidebar-width))/2)] lg:!w-[calc(100vw-var(--app-sidebar-width)-2rem)]"
      >
        <DialogHeader className="shrink-0 border-b border-primary/15 bg-gradient-to-r from-primary/[0.10] via-primary/[0.04] to-transparent px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FileText className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                Instructions to applicants
              </DialogTitle>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Please read these guidelines carefully before registering your
                claim.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 px-5 py-5 text-[13px] leading-relaxed text-muted-foreground sm:px-7 sm:py-6 sm:text-sm">
          <div className="grid gap-3 md:grid-cols-2 [&>p]:rounded-xl [&>p]:border [&>p]:border-border/70 [&>p]:bg-background [&>p]:p-4 [&>p]:shadow-xs">
            <p>
              <strong className="text-foreground">Form:</strong> For manual
              submission, the applicant must produce depositor identity proof
              (Aadhaar, PAN, or Driving Licence), the bond or agreement with the
              fraudulent entity, and a Power of Attorney where an authorised
              agent is filing the claim. The mobile number and full postal
              address with PIN code of the depositor, nominee, or Power of
              Attorney holder must be entered in the Form Issue Register along
              with the serial number and unique form number.
            </p>
            <p>
              <strong className="text-foreground">Token:</strong> When
              submitting the claim, obtain a token showing the counter number,
              serial number, and reporting time, and sign the Token Register.
              The unique form number on the token will be used for
              digitisation, tracking, queries, and communication.
            </p>
            <p>
              <strong className="text-foreground">Submission:</strong> Present
              the token counterfoil when called by the concerned counter and
              submit it with all claim documents. A token cannot be carried
              forward to another date unless it is signed and returned by the
              counter clerk. After examination, an acknowledgement stating
              whether the claim is accepted, rejected, or requires additional
              documents will be issued. The claimant must sign the
              acknowledgement and retain their copy.
            </p>
            <p>
              <strong className="text-foreground">Signature:</strong> Documents
              must be signed by the depositor. For a minor or deceased
              depositor, the parent, guardian, nominee, legal heir, or duly
              authorised Power of Attorney holder may sign, as applicable.
            </p>
            <p>
              <strong className="text-foreground">
                Producing documents:
              </strong>{" "}
              Bonds, agreements, notarised affidavits, and statutory documents
              must be produced in original. Where copies are permitted, submit
              clear, signed, and attested photocopies of every page, or produce
              the original with a photocopy for attestation by the concerned
              officer. Scanned or WhatsApp copies are not accepted.
            </p>
            <p>
              <strong className="text-foreground">Number of claims:</strong> A
              separate claim must be submitted for each Customer or Client ID
              shown in the bond or agreement. Multiple, bundled, family, or
              group claims cannot be submitted under one token.
            </p>
          </div>

          <section className="mt-4 rounded-xl border border-border/70 bg-background p-4 shadow-xs sm:p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground sm:text-base">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                1
              </span>
              Note 1: Special procedure
            </h3>
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
            <ol className="mt-1 list-decimal space-y-0.5 pl-5">
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
          </section>

          <section className="mt-3 rounded-xl border border-border/70 bg-background p-4 shadow-xs sm:p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground sm:text-base">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                2
              </span>
              Note 2: Filing by nominee, legal heir, or Power of Attorney
              holder
            </h3>
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
          </section>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t border-border/70 bg-background px-5 py-4 sm:items-center sm:justify-between sm:px-7">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg text-xs font-medium text-foreground sm:text-sm">
            <input
              type="checkbox"
              checked={instructionsAccepted}
              onChange={(event) =>
                setInstructionsAccepted(event.target.checked)
              }
              className="size-4.5 rounded border-input accent-primary"
            />
            <span>I agree to the instructions and conditions</span>
          </label>
          <DialogClose
            render={
              <Button
                disabled={!instructionsAccepted}
                className="min-w-36 shadow-sm"
              />
            }
          >
            Agree &amp; continue
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ClaimRegistrationPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [submitted, setSubmitted] = useState(false)
  const [instructionsOpen, setInstructionsOpen] = useState(true)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="Claim settlement"
        title="Claim registration"
        description="Register a depositor claim and record the related investment and bank details under the KPID Act."
        icon={ClipboardPenLine}
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

      <SectionCard className="stagger-in">
        <nav
          aria-label="Claim registration steps"
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

        {submitted ? (
          <section className="rounded-md border border-success/25 bg-success/5 p-8 text-center">
          <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-success text-white">
            <Check className="size-5" />
          </span>
          <h2 className="mt-3 font-display text-lg font-semibold">
            Claim application submitted
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The application has been recorded for verification.
          </p>
          <Button className="mt-4" onClick={() => setSubmitted(false)}>
            Register another claim
          </Button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <section className="grid gap-4 rounded-md bg-muted/20 p-4 sm:grid-cols-2">
                <FormField
                  label="Serial Number"
                  name="initialNumber"
                  placeholder="Enter serial number"
                />
                <FormField
                  label="Def. C.A. CLNO"
                  name="applicationNumber"
                  placeholder="Enter the number"
                />
                <SelectField
                  label="Competent Authority"
                  name="competentAuthority"
                  placeholder="Select Competent Authority"
                  options={[
                    "Competent Authority, Bengaluru",
                    "Competent Authority, Mysuru",
                    "Competent Authority, Belagavi",
                  ]}
                  required
                />
                <SelectField
                  label="Financial Establishment / Branch"
                  name="fraudulentEntity"
                  placeholder="Select financial establishment"
                  options={establishmentOptions}
                  required
                />
                <FormField
                  label="Claim application number"
                  name="claimApplicationNumber"
                  placeholder="Enter claim application number"
                />
                <FormField
                  label="Date of claim application"
                  name="claimApplicationDate"
                  type="date"
                />
              </section>

              <FormSection number={1} title="Applicant details">
                <FormField
                  label="Name of Claimant / Depositor"
                  name="applicantName"
                  placeholder="Enter full name"
                  required
                />
                <FormField
                  label="Father / Husband name"
                  name="guardianName"
                  placeholder="Enter father or husband name"
                />
                <FormField
                  label="Customer / Client ID"
                  name="customerId"
                  placeholder="Enter customer or client ID"
                />
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-xs font-medium text-foreground">
                    Correspondence address
                  </span>
                  <Textarea
                    name="address"
                    placeholder="Enter complete address"
                    className="min-h-20 rounded-md bg-background"
                  />
                </label>
                <FormField
                  label="Date of birth"
                  name="dateOfBirth"
                  type="date"
                />
                <FormField
                  label="Age"
                  name="age"
                  type="number"
                  placeholder="Enter age"
                />
                <FormField
                  label="Mobile number"
                  name="mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  required
                />
                <FormField
                  label="Alternate number"
                  name="alternateMobile"
                  type="tel"
                  placeholder="Enter alternate number"
                />
                <FormField
                  label="Email address"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                />
                <FormField
                  label="Aadhaar / Passport / Driving Licence number"
                  name="identityNumber"
                  placeholder="Enter identity document number"
                />
                <FormField
                  label="PAN"
                  name="pan"
                  placeholder="Enter PAN"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FileField label="Identity proof" name="identityProof" />
                  <FileField label="PAN document" name="panDocument" />
                </div>
              </FormSection>

              <FormSection number={2} title="Nominee details (if applicable)">
                <FormField
                  label="Nominee name"
                  name="nomineeName"
                  placeholder="Enter nominee name"
                />
                <FormField
                  label="Gender & Age"
                  name="nomineeAge"
                  placeholder="Enter gender and age"
                />
                <FormField
                  label="Relationship with depositor"
                  name="nomineeRelationship"
                  placeholder="Enter relationship"
                />
                <FormField
                  label="ID Proof of Nominee"
                  name="nomineeIdNumber"
                  placeholder="Enter ID proof details"
                />
                <FileField
                  label="Proof of nomination"
                  name="nominationProof"
                />
                <FileField label="Nominee ID proof" name="nomineeIdProof" />
              </FormSection>

              <FormSection number={3} title="Statement of investment">
                <SelectField
                  label="Type of scheme"
                  name="schemeType"
                  placeholder="Select scheme type"
                  options={[
                    "Deposit",
                    "Fixed deposit",
                    "Recurring deposit",
                    "Chit fund",
                    "Investment scheme",
                    "Other",
                  ]}
                  required
                />
                <FormField
                  label="Name of scheme"
                  name="schemeName"
                  placeholder="Enter scheme name"
                  required
                />
              </FormSection>

              <FormSection number={4} title="Depositor bank details">
                <FormField
                  label="Bank Account No."
                  name="depositBankAccount"
                  placeholder="Enter account number"
                  required
                />
                <FormField
                  label="IFSC code"
                  name="depositBankIfsc"
                  placeholder="Enter IFSC code"
                  required
                />
                <FormField
                  label="Bank name"
                  name="depositBankName"
                  placeholder="Enter bank name"
                />
                <FormField
                  label="Branch name"
                  name="depositBankBranch"
                  placeholder="Enter branch name"
                />
              </FormSection>

              <FormSection number={5} title="Bank details for refund">
                <FormField
                  label="Bank Account No."
                  name="refundBankAccount"
                  placeholder="Enter account number"
                  required
                />
                <FormField
                  label="IFSC code"
                  name="refundBankIfsc"
                  placeholder="Enter IFSC code"
                  required
                />
                <FormField
                  label="Bank name"
                  name="refundBankName"
                  placeholder="Enter bank name"
                />
                <FormField
                  label="Branch name"
                  name="refundBankBranch"
                  placeholder="Enter branch name"
                />
              </FormSection>

              <FormSection number={6} title="Total amount due">
                <FormField
                  label="Total amount due (in figures)"
                  name="amountDueFigures"
                  type="number"
                  placeholder="Enter amount"
                  required
                />
                <FormField
                  label="Total amount due (in words)"
                  name="amountDueWords"
                  placeholder="Enter amount in words"
                  required
                />
              </FormSection>

              <FormSection number={7} title="Declaration">
                <label className="flex gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    name="declaration"
                    required
                    className="mt-0.5 size-4 rounded border-input accent-primary"
                  />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    I hereby declare that the details furnished above are true
                    and correct to the best of my knowledge and belief.
                  </span>
                </label>
                <FormField
                  label="Place"
                  name="declarationPlace"
                  placeholder="Enter place"
                />
                <FormField
                  label="Date"
                  name="declarationDate"
                  type="date"
                />
                <FileField
                  label="Signature upload"
                  name="signature"
                  accept="image/*"
                />
              </FormSection>

              <div className="flex justify-end border-t border-border/60 pt-4">
                <Button type="button" onClick={() => setStep(2)}>
                  Next
                  <ArrowRight />
                </Button>
              </div>
            </>
          ) : (
            <>
              <FormSection number={1} title="Statement of investment">
                <FormField
                  label="Financial Establishment"
                  name="investmentFraudulentEntity"
                  placeholder="Enter financial establishment"
                  required
                />
                <FormField
                  label="Def. C.A. CLNO"
                  name="authorityReferenceNumber"
                  placeholder="Enter reference number"
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
                  placeholder="Enter scheme name"
                  required
                />
              </FormSection>

              <FormSection number={2} title="Depositor bank details">
                <FormField
                  label="Bank Account No."
                  name="stepTwoDepositorAccount"
                  placeholder="Enter account number"
                  required
                />
                <FormField
                  label="IFSC code"
                  name="stepTwoDepositorIfsc"
                  placeholder="Enter IFSC code"
                  required
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
                  <span className="font-semibold text-foreground">Note:</span>{" "}
                  For Financial Enterprise, please ensure the Account Number,
                  IFSC Code, and amounts entered for Deposit and Receipt are
                  correct, as they will be cross-verified. False information is
                  punishable.
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
                  name="entitySignature"
                  accept="image/*,.pdf"
                />
              </section>

              <div className="flex items-center justify-between border-t border-border/60 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft />
                  Previous
                </Button>
                <Button type="submit">
                  Register claim
                  <Check />
                </Button>
              </div>
            </>
          )}
          </form>
        )}
      </SectionCard>
    </PageShell>
  )
}
