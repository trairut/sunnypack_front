import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import logo from '@/assets/logo.png';

const Header = () => {
  const { user, logout } = useAuth();

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 h-14 md:h-16 border-b border-sky-200/70 bg-gradient-to-r from-white/95 via-sky-100/80 to-indigo-100/80 dark:from-background dark:via-background dark:to-background backdrop-blur-md flex items-center justify-between px-3 md:px-6 shadow-md">
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger className="md:hidden" />
        <img
          src={logo}
          alt="Sunnypack logo"
          className="hidden md:block h-10 w-auto drop-shadow-sm"
        />
        <h2 className="text-sm md:text-lg font-semibold text-foreground truncate">
          <span className="hidden md:inline">Welcome back, {user?.username}!</span>
          <span className="md:hidden">SUNNYPACK</span>
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg bg-white/90 dark:bg-muted shadow border border-sky-200/80">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
          <span className="text-xs md:text-sm text-foreground font-semibold capitalize">{user?.role}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 md:h-12 md:w-12 rounded-full ring-2 ring-primary/50 hover:ring-primary/70 transition-all duration-200 shadow-md hover:shadow-xl bg-white dark:bg-muted"
            >
              <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-background">
                <AvatarFallback className="bg-gradient-primary text-black text-sm md:text-base font-bold shadow-elegant">
                  {user && getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 md:w-56">
            <DropdownMenuLabel className="text-foreground">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={logout} 
              className="bg-destructive text-destructive-foreground cursor-pointer font-semibold hover:bg-destructive/90 focus:bg-destructive/90"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
