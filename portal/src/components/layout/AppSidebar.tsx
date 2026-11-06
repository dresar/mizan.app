import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navigationConfig, santriNavigation, type NavItem as NavItemType, type NavSection } from '@/config/navigation';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, ChevronDown, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
export function AppSidebar() {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen, isAdminSyncing } = useAppStore();
  const { user } = useAuthStore();
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []); 
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);
  const isSantri = user?.role === 'santri';
  const rawNavigation = isSantri ? santriNavigation : navigationConfig;
  const navigation = isSantri 
    ? rawNavigation 
    : rawNavigation.filter(section => {
        if (!section.roles) return true;
        return section.roles.includes(user?.role || '');
      });
  return (
    <>
      {}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {}
      <aside
        className={cn(
          'fixed left-0 top-0 z-[100] h-screen h-[100dvh] border-r bg-sidebar transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-72',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0' 
        )}
      >
        {}
        <div className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                PH
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground text-sm">Pesantren Hub</span>
                <span className="text-xs text-muted-foreground">
                  {user?.role === 'santri' ? 'Santri Portal' : 'Administrator'}
                </span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              PH
            </div>
          )}
          {}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {}
        <ScrollArea className="h-[calc(100vh-4rem-4rem)] lg:h-[calc(100vh-8rem)] h-[calc(100dvh-8rem)]">
          <nav className="p-2 space-y-2 pb-20">
            {navigation.map((section) => (
              <NavSectionItem 
                key={section.title} 
                section={section} 
                collapsed={sidebarCollapsed}
                currentPath={location.pathname}
              />
            ))}
          </nav>
        </ScrollArea>
        <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-sidebar-border bg-sidebar flex flex-col justify-center">
          {isAdminSyncing && !sidebarCollapsed && (
            <div className="flex items-center gap-2 px-4 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Background Syncing...</span>
            </div>
          )}
          {isAdminSyncing && sidebarCollapsed && (
            <div className="flex justify-center mb-1">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            </div>
          )}
          <div className="flex h-full items-center justify-center px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                'hidden lg:flex w-full gap-2',
                sidebarCollapsed && 'justify-center'
              )}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
interface NavSectionProps {
  section: NavSection;
  collapsed: boolean;
  currentPath: string;
}
function NavSectionItem({ section, collapsed, currentPath }: NavSectionProps) {
  const Icon = section.icon || ChevronRight;
  const isActive = section.items.some(item => 
    currentPath === item.href || currentPath.startsWith(item.href + '/')
  );
  const [isOpen, setIsOpen] = useState(isActive);
  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);
  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg mx-auto flex",
              isActive && "bg-primary/10 text-primary"
            )}
            title={section.title}
          >
            <Icon className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56" align="start">
          <DropdownMenuLabel>{section.title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            const isItemActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
            return (
              <DropdownMenuItem key={item.href} asChild className={cn(isItemActive && "bg-primary/10 text-primary")}>
                <Link to={item.href} className="cursor-pointer flex items-center gap-2">
                  <ItemIcon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between px-3 py-2 h-auto font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && !isOpen && "text-primary"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm">{section.title}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen ? "rotate-0" : "-rotate-90"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {section.items.map((item) => {
          const ItemIcon = item.icon;
          const isItemActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg pl-10 pr-3 py-2 text-sm transition-colors",
                isItemActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <ItemIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
