import { Lock, LockOpen, ScanSearch, BarChart3, ShieldCheck, ShieldIcon, Layers } from 'lucide-react'
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
  { label: 'AES-256-GCM', Icon: ShieldIcon },
  { label: 'LSB Stego',   Icon: Layers     },
]

const user = {
  name: 'User123',
  email: 'user@example.com',
  avatar: '',
}

export function AppSidebar({ activeTab, onTabChange, ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-3 hover:bg-transparent cursor-default select-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 shrink-0">
                <ShieldCheck size={17} />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-[14px] font-bold tracking-tight">StegoVault</span>
                <span className="text-[10px] text-muted-foreground">v2.0 · AI Powered</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Vault</SidebarGroupLabel>
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
                      ? 'bg-[#00ff41]/10 text-[#00ff41] font-medium hover:bg-[#00ff41]/15 border-l-2 border-[#00ff41]'
                      : 'hover:bg-accent'
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
          <SidebarGroupLabel>Security Stack</SidebarGroupLabel>
          <SidebarMenu>
            {SECURITY_INFO.map(({ label, Icon }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  tooltip={label}
                  className="text-muted-foreground/50 text-[12px] pointer-events-none"
                >
                  <Icon size={13} />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
