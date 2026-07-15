/**
 * components/layout/AppLayout.jsx — Logged-In Application Shell
 *
 * Premium features:
 * - Gradient sidebar with active link glow + animated indicator pill
 * - Collapsible desktop sidebar with smooth width transition
 * - Gradient brand icon in sidebar header
 * - Top header with subtle border + glassmorphism on scroll
 * - Animated profile dropdown
 * - Mobile drawer with spring animation
 */

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate, Link, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeartbeat,
  FaFolder,
  FaQrcode,
  FaCog,
  FaHistory,
  FaShieldAlt,
  FaUsersCog,
  FaClipboardList,
  FaStream,
  FaBars,
  FaMoon,
  FaSun,
  FaChevronDown,
  FaSignOutAlt,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

import {
  selectCurrentUser,
  logoutUser,
  selectUserRole,
} from '@/features/auth/authSlice';
import {
  selectIsDarkMode,
  toggleDarkMode,
  selectIsSidebarOpen,
  toggleSidebar,
} from '@/features/ui/uiSlice';
import { ROUTES } from '@/utils/constants';
import Avatar from '@/components/common/Avatar';

// ── Menu definitions ──────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { label: 'Dashboard',        path: ROUTES.DASHBOARD,  icon: FaHeartbeat },
  { label: 'Medical Profile',  path: ROUTES.PROFILE,    icon: FaUser },
  { label: 'Secure Documents', path: ROUTES.DOCUMENTS,  icon: FaFolder },
  { label: 'QR Code Access',   path: ROUTES.QR_CODE,    icon: FaQrcode },
  { label: 'Health Timeline',  path: ROUTES.TIMELINE,   icon: FaStream },
  { label: 'Activity Logs',    path: ROUTES.ACTIVITY,   icon: FaHistory },
  { label: 'Settings',         path: ROUTES.SETTINGS,   icon: FaCog },
];

const ADMIN_ITEMS = [
  { label: 'Admin Overview',   path: ROUTES.ADMIN,          icon: FaShieldAlt, end: true },
  { label: 'User Management',  path: ROUTES.ADMIN_USERS,    icon: FaUsersCog },
  { label: 'System Activity',  path: ROUTES.ADMIN_ACTIVITY, icon: FaClipboardList },
];

const PAGE_TITLES = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PROFILE]:   'Medical Profile',
  [ROUTES.DOCUMENTS]: 'Secure Documents',
  [ROUTES.QR_CODE]:   'QR Code & Emergency',
  [ROUTES.TIMELINE]:  'Health Timeline',
  [ROUTES.SETTINGS]:  'Account Settings',
  [ROUTES.ACTIVITY]:  'Activity Logs',
  [ROUTES.ADMIN]:     'Admin Control Center',
  [ROUTES.ADMIN_USERS]:    'User Management',
  [ROUTES.ADMIN_ACTIVITY]: 'System Activity',
};

// ── Nav Link ──────────────────────────────────────────────────────────────────
const SidebarLink = ({ item, isCollapsed, variant = 'default' }) => {
  const activeClasses =
    variant === 'admin'
      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_4px_12px_rgba(124,58,237,0.35)]'
      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]';

  return (
    <NavLink
      to={item.path}
      end={item.end}
      title={isCollapsed ? item.label : undefined}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold
         transition-all duration-200 cursor-pointer group
         ${isActive ? activeClasses : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}
         ${isCollapsed ? 'justify-center' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'
            }`}
            aria-hidden="true"
          />
          {!isCollapsed && (
            <span className="truncate leading-none">{item.label}</span>
          )}
          {/* Active glow dot */}
          {isActive && !isCollapsed && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 shrink-0 animate-pulse" aria-hidden="true" />
          )}
        </>
      )}
    </NavLink>
  );
};

// ── Sidebar Nav ───────────────────────────────────────────────────────────────
// For admins the Control Center leads and personal modules live in a
// collapsible "My Vault" group (collapsed by default) so admin tools stay
// the visual focus. Preference persists across sessions.
const PERSONAL_NAV_KEY = 'lifevault-admin-personal-nav';

const SidebarNav = ({ isCollapsed, userRole }) => {
  const location = useLocation();
  const isAdmin = userRole === 'admin';

  const isOnPersonalRoute = MENU_ITEMS.some((item) =>
    location.pathname.startsWith(item.path)
  );

  const [personalOpen, setPersonalOpen] = useState(
    () => localStorage.getItem(PERSONAL_NAV_KEY) === 'open'
  );

  // Keep the group open while the admin is actually on a personal page
  useEffect(() => {
    if (isAdmin && isOnPersonalRoute) setPersonalOpen(true);
  }, [isAdmin, isOnPersonalRoute]);

  const togglePersonal = () => {
    setPersonalOpen((prev) => {
      localStorage.setItem(PERSONAL_NAV_KEY, prev ? 'closed' : 'open');
      return !prev;
    });
  };

  // Regular users: unchanged flat menu
  if (!isAdmin) {
    return (
      <div className="space-y-1.5 px-3">
        {MENU_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} isCollapsed={isCollapsed} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 px-3">
      {/* ── Control Center (highlighted, always first) ── */}
      {!isCollapsed && (
        <p className="px-3.5 pb-1.5 pt-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-violet-400 flex items-center gap-1.5">
          <FaShieldAlt className="h-2.5 w-2.5" aria-hidden="true" />
          Control Center
        </p>
      )}
      <div
        className={`space-y-1 rounded-2xl ${
          isCollapsed
            ? ''
            : 'p-1.5 bg-violet-500/[0.07] border border-violet-500/15'
        }`}
      >
        {ADMIN_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} isCollapsed={isCollapsed} variant="admin" />
        ))}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-800" />

      {/* ── My Vault (collapsible personal modules) ── */}
      {isCollapsed ? (
        // Icon-only sidebar: show personal icons directly below the divider
        MENU_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} isCollapsed />
        ))
      ) : (
        <>
          <button
            type="button"
            onClick={togglePersonal}
            aria-expanded={personalOpen}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              My Vault
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-bold tracking-normal normal-case">
                {MENU_ITEMS.length}
              </span>
            </span>
            <FaChevronDown
              className={`h-2.5 w-2.5 transition-transform duration-200 ${
                personalOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence initial={false}>
            {personalOpen && (
              <motion.div
                key="personal-nav"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="space-y-1.5 overflow-hidden"
              >
                {MENU_ITEMS.map((item) => (
                  <SidebarLink key={item.path} item={item} isCollapsed={false} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

// ── App Layout ────────────────────────────────────────────────────────────────
const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector(selectCurrentUser) || {};
  const userRole = useSelector(selectUserRole);
  const isDarkMode = useSelector(selectIsDarkMode);
  const isMobileOpen = useSelector(selectIsSidebarOpen);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (isMobileOpen) dispatch(toggleSidebar());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.LOGIN);
  };

  // Resolve page title
  const pageTitle =
    Object.entries(PAGE_TITLES).find(([route]) =>
      location.pathname.startsWith(route)
    )?.[1] ?? 'LifeVault';

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────────── */}
      <aside
        aria-label="Dashboard sidebar"
        className={`
          hidden md:flex flex-col shrink-0 h-screen sticky top-0
          bg-slate-900 border-r border-slate-800
          transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        {/* Brand */}
        <div className={`flex items-center border-b border-slate-800/80 h-16 px-4 shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5 min-w-0 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.3)] shrink-0 transition-transform duration-200 group-hover:scale-105">
                <FaShieldAlt className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white truncate">
                Life<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Vault</span>
              </span>
            </Link>
          )}

          {isCollapsed && (
            <Link to={ROUTES.DASHBOARD} className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.3)]">
              <FaShieldAlt className="h-4 w-4 text-white" aria-hidden="true" />
            </Link>
          )}

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150 cursor-pointer"
              aria-label="Collapse sidebar"
            >
              <FaChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}

          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white shadow-sm transition-colors cursor-pointer"
              aria-label="Expand sidebar"
            >
              <FaChevronRight className="h-2.5 w-2.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-none">
          <SidebarNav isCollapsed={isCollapsed} userRole={userRole} />
        </div>

        {/* User card */}
        <div className={`shrink-0 border-t border-slate-800 p-4 ${isCollapsed ? 'flex justify-center' : 'flex items-center gap-3'}`}>
          <Avatar
            src={user.profilePhoto?.url}
            name={user.name}
            size="sm"
            ring
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate leading-none">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-1">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* ── MOBILE DRAWER SIDEBAR ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => dispatch(toggleSidebar())}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-64 md:hidden flex flex-col bg-slate-900 border-r border-slate-800"
              aria-label="Mobile navigation drawer"
            >
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.3)]">
                    <FaShieldAlt className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-white">
                    Life<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Vault</span>
                  </span>
                </div>
                <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <FaChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {/* Nav */}
              <div className="flex-1 overflow-y-auto py-4 scrollbar-none">
                <SidebarNav isCollapsed={false} userRole={userRole} />
              </div>

              {/* User */}
              <div className="p-4 border-t border-slate-800 flex items-center gap-3 shrink-0">
                <Avatar src={user.profilePhoto?.url} name={user.name} size="sm" ring />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-white truncate leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-1">{user.email}</p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-5 md:px-8 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 transition-all duration-200 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden transition-colors cursor-pointer"
              aria-label="Open navigation"
            >
              <FaBars className="h-4.5 w-4.5" aria-hidden="true" />
            </button>

            <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDarkMode ? 'sun' : 'moon'}
                  initial={{ opacity: 0, rotate: -30 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 30 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  {isDarkMode
                    ? <FaSun className="h-4 w-4" aria-hidden="true" />
                    : <FaMoon className="h-4 w-4" aria-hidden="true" />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
              >
                <Avatar
                  src={user.profilePhoto?.url}
                  name={user.name}
                  size="sm"
                  ring
                />
                <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[80px] truncate">
                  {user.name?.split(' ')[0]}
                </span>
                <motion.span
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="h-3 w-3 text-slate-400" aria-hidden="true" />
                </motion.span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 380 }}
                    role="menu"
                    className="absolute right-0 mt-2 w-52 z-50 overflow-hidden
                      bg-white dark:bg-slate-900
                      border border-slate-200/80 dark:border-slate-700/60
                      rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Links */}
                    <div className="py-1.5" role="none">
                      <Link
                        to={ROUTES.PROFILE}
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <FaUser className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                        My Profile
                      </Link>
                      <Link
                        to={ROUTES.SETTINGS}
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <FaCog className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                        Settings
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-slate-100 dark:border-slate-800 p-1.5">
                      <button
                        onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                        role="menuitem"
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      >
                        <FaSignOutAlt className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          id="main-content"
          className="flex-1 p-5 md:p-8 overflow-y-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
