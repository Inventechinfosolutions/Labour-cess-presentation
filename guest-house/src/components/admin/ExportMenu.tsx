import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface ExportMenuProps {
  label?: string
}

export function ExportMenu({ label = "Export" }: ExportMenuProps) {
  const handleExport = (format: string) => {
    toast.success(`${format} export started (demo)`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <Download className="mr-1.5 size-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem className="rounded-lg" onClick={() => handleExport("PDF")}>
          <FileText className="mr-2 size-4" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg" onClick={() => handleExport("Excel")}>
          <FileSpreadsheet className="mr-2 size-4" />
          Export Excel
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg" onClick={() => handleExport("CSV")}>
          <Download className="mr-2 size-4" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg" onClick={() => handleExport("Print")}>
          <Printer className="mr-2 size-4" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
