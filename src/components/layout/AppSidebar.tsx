import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, User, Lock, BoxIcon, MapPin, Users } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import logo from '@/assets/logo.png';
import { useAuth } from '@/contexts/AuthContext';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';
  const { user } = useAuth();

  const menuItems = useMemo(() => [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BoxIcon, label: 'Material Master', path: '/material-master' },
    { icon: MapPin, label: 'Location Master', path: '/location-master', hidden: user?.user_type === 'company' },
    { icon: Users, label: 'User Management', path: '/user-management' },
    { icon: Settings, label: 'API Management', path: '/api-management' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Lock, label: 'Change Password', path: '/change-password' },
  ], [user?.user_type]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-gradient-to-b from-slate-100 via-sky-100/70 to-indigo-100/60 dark:from-sidebar-background dark:via-sidebar-background dark:to-sidebar-background">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Sunnypack logo" className="w-10 h-10 rounded-xl shadow-elegant flex-shrink-0 object-cover" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-sidebar-foreground truncate">SUNNYPACK</h1>
              <p className="text-xs text-sidebar-foreground/60 truncate">WMS Fulfillment</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-4 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              เมนูหลัก
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {menuItems.filter((item) => !item.hidden).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="h-11"
                    >
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
