import {
  Home,
  BarChart3,
  Users,
  FileText,
  Mail,
  Calendar,
  Palette,
  Code,
  Zap,
  Settings,
  Search,
  LogIn,
  UserPlus,
  // LogOut, // Removed as it's not currently used
  Sparkles,
} from "lucide-react";
import { UserDropdown } from "@/components/user-dropdown";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Main navigation items
const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: Mail,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
];

// Development items
const devItems = [
  {
    title: "Components",
    url: "/components",
    icon: Palette,
  },
  {
    title: "Code Editor",
    url: "/editor",
    icon: Code,
  },
  {
    title: "Performance",
    url: "/performance",
    icon: Zap,
  },
];

// Settings items
const settingsItems = [
  {
    title: "General",
    url: "/settings/general",
    icon: Settings,
  },
  {
    title: "Search",
    url: "/settings/search",
    icon: Search,
  },
];

// Auth items (for logged out users)
const authItems = [
  {
    title: "Login",
    url: "/auth/login",
    icon: LogIn,
  },
  {
    title: "Register",
    url: "/auth/register",
    icon: UserPlus,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center space-x-2 px-4 py-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SamCon
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Development</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {devItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* GA Forms Section */}
        <SidebarGroup>
          <SidebarGroupLabel>GA Forms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/SLConfigForm">
                    <FileText className="w-4 h-4" />
                    <span>SL Config</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/FeederLayoutsForm">
                    <FileText className="w-4 h-4" />
                    <span>Feeder Layouts</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/FeedersForm">
                    <FileText className="w-4 h-4" />
                    <span>Feeders</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/FeederTypesForm">
                    <FileText className="w-4 h-4" />
                    <span>Feeder Types</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/BreakerTypesForm">
                    <FileText className="w-4 h-4" />
                    <span>Breaker Types</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/SourceTypesForm">
                    <FileText className="w-4 h-4" />
                    <span>Source Types</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/StarterTypesForm">
                    <FileText className="w-4 h-4" />
                    <span>Starter Types</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/PanelLocationsForm">
                    <FileText className="w-4 h-4" />
                    <span>Panel Locations</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/EquipmentTypesForm">
                    <FileText className="w-4 h-4" />
                    <span>Equipment Types</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/EquipmentDataForm">
                    <FileText className="w-4 h-4" />
                    <span>Equipment Data</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/PanelsForm">
                    <FileText className="w-4 h-4" />
                    <span>Panels</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/ProjectsForm">
                    <FileText className="w-4 h-4" />
                    <span>Projects</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/ClientsForm">
                    <FileText className="w-4 h-4" />
                    <span>Clients</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/UsersForm">
                    <FileText className="w-4 h-4" />
                    <span>Users</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/TeamsForm">
                    <FileText className="w-4 h-4" />
                    <span>Teams</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/ga/forms/RolesForm">
                    <FileText className="w-4 h-4" />
                    <span>Roles</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Authentication</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {authItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2">
          <UserDropdown />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
