"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
// Avatar components removed as they're not currently used
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings, Users, FileText, BarChart3, Home, Zap } from "lucide-react";
import { UserDropdown } from "@/components/user-dropdown";

interface CpLayoutProps {
  children: React.ReactNode;
}

export default function CpLayout({ children }: CpLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">EP Designer</span>
                <span className="truncate text-xs">Control Panel</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/data-import">
                        <Zap className="mr-2 h-4 w-4" />
                        Panel Design
                        <Badge variant="secondary" className="ml-auto">
                          V2
                        </Badge>
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild>
                      <a href="/cp/panel-design">
                        <Zap className="mr-2 h-4 w-4" />
                        Panel Design
                        <Badge variant="secondary" className="ml-auto">
                          V1
                        </Badge>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarSeparator />
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/projects">
                        <FileText className="mr-2 h-4 w-4" />
                        Projects
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/reports">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Reports
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/users">
                        <Users className="mr-2 h-4 w-4" />
                        Users
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
                      <a href="/cp/sl-config">
                        <FileText className="w-4 h-4" />
                        <span>SL Config</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/feeder-layouts">
                        <FileText className="w-4 h-4" />
                        <span>Feeder Layouts</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/feeders">
                        <FileText className="w-4 h-4" />
                        <span>Feeders</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/feeder-types">
                        <FileText className="w-4 h-4" />
                        <span>Feeder Types</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/breaker-types">
                        <FileText className="w-4 h-4" />
                        <span>Breaker Types</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/source-types">
                        <FileText className="w-4 h-4" />
                        <span>Source Types</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/starter-types">
                        <FileText className="w-4 h-4" />
                        <span>Starter Types</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/panel-locations">
                        <FileText className="w-4 h-4" />
                        <span>Panel Locations</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/equipment-types">
                        <FileText className="w-4 h-4" />
                        <span>Equipment Types</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/equipment-data">
                        <FileText className="w-4 h-4" />
                        <span>Equipment Data</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/panels">
                        <FileText className="w-4 h-4" />
                        <span>Panels</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/projects">
                        <FileText className="w-4 h-4" />
                        <span>Projects</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/clients">
                        <FileText className="w-4 h-4" />
                        <span>Clients</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/users">
                        <FileText className="w-4 h-4" />
                        <span>Users</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/teams">
                        <FileText className="w-4 h-4" />
                        <span>Teams</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/roles">
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
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/cp/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t px-2 py-2">
            <UserDropdown />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                Electrical Panel Designer
              </h1>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
