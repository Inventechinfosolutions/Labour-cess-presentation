import { useEffect, useMemo, useState } from "react"
import { LayoutGrid, X } from "lucide-react"
import { getGalleryFallback } from "@/utils/entityImages"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface GalleryImageProps {
  src: string
  alt: string
  fallbackIndex: number
  className?: string
}

function GalleryImage({ src, alt, fallbackIndex, className }: GalleryImageProps) {
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setAttempt(0)
  }, [src])

  const currentSrc = attempt === 0 ? src : getGalleryFallback(fallbackIndex + attempt - 1)

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      onError={() => setAttempt((prev) => prev + 1)}
      className={className}
    />
  )
}

function buildGallery(images: string[], count = 5) {
  const gallery = images.slice(0, count)
  while (gallery.length < count) {
    gallery.push(getGalleryFallback(gallery.length))
  }
  return gallery
}

const THUMB_RADIUS = [
  "rounded-tl-xl rounded-bl-xl",
  "rounded-tr-xl",
  "",
  "",
  "rounded-br-xl",
] as const

interface PropertyPhotoGalleryProps {
  images: string[]
  title: string
  className?: string
}

export function PropertyPhotoGallery({ images, title, className }: PropertyPhotoGalleryProps) {
  const [open, setOpen] = useState(false)
  const gallery = useMemo(() => buildGallery(images), [images])
  const [main, ...rest] = gallery

  if (!main) return null

  return (
    <>
      <div className={cn("property-photo-gallery", className)}>
        {/* Desktop / tablet — Airbnb 1+4 grid */}
        <div className="hidden h-[280px] grid-cols-4 grid-rows-2 gap-2 sm:grid lg:h-[360px]">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "group relative col-span-2 row-span-2 overflow-hidden bg-muted",
              THUMB_RADIUS[0]
            )}
          >
            <GalleryImage
              src={main}
              alt={title}
              fallbackIndex={0}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
          </button>

          {rest.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                "group relative overflow-hidden bg-muted",
                THUMB_RADIUS[index + 1]
              )}
            >
              <GalleryImage
                src={image}
                alt=""
                fallbackIndex={index + 1}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
              {index === rest.length - 1 && (
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg border border-foreground/80 bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted/80">
                  <LayoutGrid className="size-4" />
                  Show all photos
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile — single hero image */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted sm:hidden"
        >
          <GalleryImage
            src={main}
            alt={title}
            fallbackIndex={0}
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg border border-foreground/80 bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm">
            <LayoutGrid className="size-4" />
            Show all photos
          </span>
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[92vh] rounded-t-2xl p-0 sm:max-w-none">
          <SheetHeader className="border-b border-border/60 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <SheetTitle>{title}</SheetTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
                aria-label="Close gallery"
              >
                <X className="size-5" />
              </button>
            </div>
          </SheetHeader>
          <div className="grid gap-2 overflow-y-auto p-2 sm:grid-cols-2 sm:p-4">
            {gallery.map((image, index) => (
              <div key={`${image}-full-${index}`} className="overflow-hidden rounded-xl bg-muted">
                <GalleryImage
                  src={image}
                  alt=""
                  fallbackIndex={index}
                  className="aspect-[4/3] w-full object-cover sm:aspect-auto sm:min-h-[240px]"
                />
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
