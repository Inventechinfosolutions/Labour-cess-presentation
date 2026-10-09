import { useRef, type ChangeEvent } from "react"
import { ImagePlus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MAX_IMAGE_SIZE_MB, readImageFile } from "@/utils/readImageFile"
import { toast } from "sonner"

interface RoomImageUploadProps {
  label?: string
  image: string
  onChange: (image: string) => void
  compact?: boolean
  hint?: string
}

export function RoomImageUpload({
  label = "Room photo",
  image,
  onChange,
  compact,
  hint,
}: RoomImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    try {
      onChange(await readImageFile(file))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleSelect}
      />
      {image ? (
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20">
          <img
            src={image}
            alt="Room preview"
            className={compact ? "aspect-[16/10] w-full object-cover" : "aspect-[4/3] w-full object-cover"}
          />
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-lg text-xs"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-1 size-3" />
              Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-lg text-xs text-destructive hover:text-destructive"
              onClick={() => onChange("")}
            >
              <Trash2 className="mr-1 size-3" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={
            compact
              ? "flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-primary/25 bg-primary/[0.03] px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.06]"
              : "flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/25 bg-gradient-to-br from-primary/[0.04] to-accent/10 px-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.06]"
          }
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ImagePlus className="size-4" />
          </div>
          <div className={compact ? "min-w-0" : undefined}>
            <p className="text-xs font-medium">Upload room photo</p>
            <p className="text-[11px] text-muted-foreground">
              JPG, PNG or WebP · max {MAX_IMAGE_SIZE_MB} MB
            </p>
          </div>
        </button>
      )}
      {hint && !image && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
