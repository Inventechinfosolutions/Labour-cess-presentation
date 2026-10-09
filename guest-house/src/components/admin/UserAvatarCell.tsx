import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserAvatar } from "@/utils/entityImages"
import { cn } from "@/lib/utils"

interface UserAvatarCellProps {
  id: string
  name: string
  subtitle?: string
  href?: string
  className?: string
}

export function UserAvatarCell({ id, name, subtitle, href, className }: UserAvatarCellProps) {
  const initial = name.charAt(0).toUpperCase()
  const avatarUrl = getUserAvatar(name, id)

  const content = (
    <>
      <Avatar className="size-9 shrink-0 ring-1 ring-border">
        <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{name}</p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </>
  )

  if (href) {
    return (
      <Link
        to={href}
        className={cn(
          "flex items-center gap-3 transition-colors hover:text-primary",
          className
        )}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {content}
    </div>
  )
}
