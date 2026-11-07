import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, LogIn, Monitor, LayoutDashboard } from 'lucide-react';
import PublicThemeToggle from '@/components/shared/PublicThemeToggle';
import { Logo } from '@/components/shared/Logo';
import { navItems } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';
import { usePublicData } from '@/hooks/use-public-data';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { data: settings } = usePublicData<any>(['settings'], '/core/settings');
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);
  const isActive = (path: string) => location.pathname === path;
  const getDashboardLink = () => {
    if (!user) return '/login';
    const rawRole = (user.role || '').toString();
    const role = rawRole.toLowerCase();
    if (role === 'adminwebsite' || role === 'superadmin' || role === 'admin' || role === 'staff') {
      return '/admin-cms';
    }
    if (rawRole === 'SUPER_ADMIN' || role === 'super_admin') {
      return '/admin/dashboard';
    }
    if (rawRole === 'PENGASUHAN' || role === 'pengasuhan') {
      return '/bk/dashboard';
    }
    if (rawRole === 'GURU' || role === 'guru') {
      return '/guru/dashboard';
    }
    if (rawRole === 'SATPAM' || role === 'satpam') {
      return '/satpam';
    }
    if (rawRole === 'ORTU' || role === 'ortu') {
      return '/ortu/dashboard';
    }
    if (role === 'santri' || role === 'user') {
      const identifier = user.username || user.id;
      return `/santri/dashboard/${identifier}`;
    }
    return '/admin-cms';
  };
  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-2'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-2 md:py-4'
        }`}
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {}
            <div className="lg:hidden flex-1 flex justify-start">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-md transition-colors ${scrolled ? 'text-foreground hover:bg-secondary' : 'text-white hover:bg-white/10'}`}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            {}
            <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
              <Link to="/" className="flex items-center gap-2.5 shrink-0">
                {}
                <div className="hidden lg:block">
                  <Logo variant="icon" iconClassName="w-10 h-10" />
                </div>
                {/* Desktop Text */}
                <div className={`hidden lg:block ${scrolled ? 'text-foreground' : 'text-white'}`}>
                  <span className="text-sm font-bold tracking-tight leading-none block">{settings?.namaInstansi || 'Raudhatussalam'}</span>
                  <span className={`text-[10px] leading-none ${scrolled ? 'text-muted-foreground' : 'text-white/80'}`}>{settings?.tagline || 'Pesantren Modern'}</span>
                </div>
                {/* Mobile Text */}
                <div className={`block lg:hidden ${scrolled ? 'text-foreground' : 'text-white'}`}>
                  <span className="text-xs font-bold tracking-tight leading-none block text-center">{settings?.singkatan || settings?.namaInstansi || 'Raudhatussalam Mahato'}</span>
                </div>
              </Link>
            </div>
            {}
            <nav className="hidden lg:flex items-center gap-1 mx-auto">
              {navItems.map((item) => {
                const checkActive = (href: string) => {
                    if (href === '/') return location.pathname === '/';
                    return location.pathname === href || location.pathname.startsWith(href + '/');
                };
                const isChildActive = item.children?.some((child: any) => checkActive(child.href));
                const isSelfActive = checkActive(item.href);
                const isActiveItem = isSelfActive || isChildActive;
                let containerClasses = "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5";
                if (isActiveItem) {
                  containerClasses += " bg-[#2FB36D] text-white shadow-md shadow-emerald-500/20 hover:bg-[#259e5e]";
                } else {
                  containerClasses += scrolled 
                    ? " text-foreground/70 hover:text-foreground hover:bg-secondary" 
                    : " text-white/90 hover:text-white hover:bg-white/10";
                }
                return (
                  <div key={item.label} className="relative group">
                    {item.children ? (
                      <button className={containerClasses}>
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 ${isActiveItem ? 'text-white/80' : 'opacity-70'}`} />
                      </button>
                    ) : (
                      <Link to={item.href} className={containerClasses}>
                        {item.label}
                      </Link>
                    )}
                    {}
                    {item.children && (
                      <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                        <div className="bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-2 min-w-[220px] overflow-hidden">
                          {item.children.map((child) => {
                            const isChildActive = checkActive(child.href);
                            return (
                              <Link
                                key={child.href}
                                to={child.href}
                                className={`block px-3 py-2.5 text-sm rounded-lg transition-colors ${
                                  isChildActive 
                                    ? 'bg-primary/10 text-primary font-medium' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
            {}
            <div className="flex-1 lg:flex-none flex items-center justify-end gap-3">
              {}
              <div className="hidden lg:flex items-center gap-3">
                <PublicThemeToggle compact className={scrolled ? 'text-muted-foreground hover:bg-secondary' : 'text-white hover:bg-white/10'} />
                {isAuthenticated ? (
                  <Link 
                    to={getDashboardLink()} 
                    className={`p-2 rounded-full transition-colors ${scrolled ? 'text-muted-foreground hover:bg-secondary' : 'text-white hover:bg-white/10'}`}
                    title="Dashboard"
                  >
                      <LayoutDashboard className="w-5 h-5" />
                  </Link>
                ) : (
                  <a 
                    href="/login" 
                    className={`p-2 rounded-full transition-colors ${scrolled ? 'text-muted-foreground hover:bg-secondary' : 'text-white hover:bg-white/10'}`}
                    title="Masuk"
                  >
                      <LogIn className="w-5 h-5" />
                  </a>
                )}
              </div>
              {}
              <div className="lg:hidden flex items-center gap-3">
                  <PublicThemeToggle compact className={scrolled ? 'bg-secondary border-border text-foreground border' : 'bg-white/10 border-white/20 text-white border'} />
                  {!isAuthenticated && (
                    <a
                      href="/login"
                      className={`p-2 rounded-md transition-colors ${scrolled ? 'text-foreground hover:bg-secondary' : 'text-white hover:bg-white/10'}`}
                      aria-label="Masuk"
                    >
                      <LogIn className="w-6 h-6" />
                    </a>
                  )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {}
      <AnimatePresence>
        {isOpen && (
          <>
            {}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            {}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[85%] sm:w-[350px] bg-background border-r border-border shadow-2xl z-[70] overflow-y-auto"
            >
              <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Logo variant="icon" iconClassName="w-8 h-8" />
                      <span className="font-bold text-lg tracking-tight">Raudhatussalam</span>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <div key={item.label} className="border-b border-border/40 last:border-0 pb-1">
                        {item.children ? (
                          <div className="py-2">
                             <button 
                               onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                               className="w-full flex items-center justify-between font-medium text-base text-foreground px-2 py-1 hover:bg-secondary rounded-md transition-colors"
                             >
                               {item.label}
                               <ChevronDown 
                                 className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`} 
                               />
                             </button>
                             <AnimatePresence>
                               {openDropdown === item.label && (
                                 <motion.div
                                   initial={{ height: 0, opacity: 0 }}
                                   animate={{ height: 'auto', opacity: 1 }}
                                   exit={{ height: 0, opacity: 0 }}
                                   transition={{ duration: 0.2 }}
                                   className="overflow-hidden"
                                 >
                                   <div className="pl-4 space-y-1 border-l-2 border-primary/20 ml-4 mt-1 pb-1">
                                      {item.children.map(child => (
                                        <Link 
                                          key={child.href} 
                                          to={child.href}
                                          onClick={() => setIsOpen(false)}
                                          className="block py-2 px-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                                        >
                                          {child.label}
                                        </Link>
                                      ))}
                                   </div>
                                 </motion.div>
                               )}
                             </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className="block font-medium text-base py-3 px-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-border flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm font-medium text-muted-foreground">Tema Tampilan</span>
                      <PublicThemeToggle />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {isAuthenticated ? (
                        <Link 
                          to={getDashboardLink()}
                          onClick={() => setIsOpen(false)}
                          className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 shadow-sm transition-colors"
                        >
                          Dashboard
                        </Link>
                      ) : (
                        <>
                          <a 
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-secondary transition-colors"
                          >
                            Masuk
                          </a>
                          <a 
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 shadow-sm transition-colors"
                          >
                            Daftar
                          </a>
                        </>
                      )}
                    </div>
                  </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
export default Navbar;