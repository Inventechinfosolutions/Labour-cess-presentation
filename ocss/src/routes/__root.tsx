import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Sidebar,
  useSidebarCollapsed,
} from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav'
import { cn } from '@/lib/utils'

export type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const { collapsed, onCollapsedChange } = useSidebarCollapsed()

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--app-sidebar-width',
      collapsed ? '72px' : '240px',
    )

    return () => {
      document.documentElement.style.removeProperty('--app-sidebar-width')
    }
  }, [collapsed])

  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="min-h-svh min-w-0">
          <Sidebar
            open={navOpen}
            onClose={() => setNavOpen(false)}
            collapsed={collapsed}
            onCollapsedChange={onCollapsedChange}
          />
          <div
            className={cn(
              'min-w-0 transition-[padding] duration-300 ease-out',
              collapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]',
            )}
          >
            <Topbar onMenu={() => setNavOpen(true)} />
            <Outlet />
          </div>
          <MobileBottomNav />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  )
}
