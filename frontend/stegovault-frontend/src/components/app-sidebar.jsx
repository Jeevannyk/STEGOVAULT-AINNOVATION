import { Lock, LockOpen, ScanSearch, BarChart3, ShieldCheck, KeyRound, Layers } from 'lucide-react'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { id: 'encode',    label: 'Encode',    Icon: Lock       },
  { id: 'decode',    label: 'Decode',    Icon: LockOpen   },
  { id: 'analyze',   label: 'Analyze',   Icon: ScanSearch },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3  },
]

const SECURITY_INFO = [
  { label: 'AES-256-GCM', Icon: KeyRound },
  { label: 'LSB stego',   Icon: Layers   },
]

export function AppSidebar({ activeTab, onTabChange, user, ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-2.5 hover:bg-transparent cursor-default select-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
                <ShieldCheck size={17} />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-[14px] font-semibold tracking-tight">StegoVault</span>
                <span className="text-[11px] text-muted-foreground">Secure steganography</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  isActive={activeTab === id}
                  tooltip={label}
                  onClick={() => onTabChange(id)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    activeTab === id
                      ? 'data-[active=true]:bg-primary/10 data-[active=true]:text-primary font-medium hover:bg-primary/15 hover:text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Security stack</SidebarGroupLabel>
          <SidebarMenu>
            {SECURITY_INFO.map(({ label, Icon }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton tooltip={label} className="text-muted-foreground text-[12.5px] pointer-events-none">
                  <Icon size={13} />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user ?? { name: 'Account', email: '', initials: 'SV' }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
