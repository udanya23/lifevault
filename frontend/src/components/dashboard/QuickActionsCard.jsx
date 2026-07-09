/**
 * components/dashboard/QuickActionsCard.jsx — Navigation Shortcuts Card
 *
 * Premium: gradient icon containers, arrow indicator on hover, card lift.
 */

import { Link } from 'react-router-dom';
import {
  FaQrcode,
  FaFileMedical,
  FaFileImage,
  FaHistory,
  FaCog,
  FaArrowRight,
} from 'react-icons/fa';
import { ROUTES } from '@/utils/constants';

const actions = [
  {
    label: 'My QR Code',
    desc: 'Show or print your emergency code',
    path: ROUTES.QR_CODE,
    icon: FaQrcode,
    iconClass: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-200/70 dark:hover:border-blue-700/50',
    hoverBg: 'hover:bg-blue-50/40 dark:hover:bg-blue-900/10',
  },
  {
    label: 'Medical Info',
    desc: 'Update allergies & conditions',
    path: ROUTES.PROFILE,
    icon: FaFileMedical,
    iconClass: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-200/70 dark:hover:border-emerald-700/50',
    hoverBg: 'hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10',
  },
  {
    label: 'Vault Documents',
    desc: 'Upload insurance & records',
    path: ROUTES.DOCUMENTS,
    icon: FaFileImage,
    iconClass: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
    hoverBorder: 'hover:border-violet-200/70 dark:hover:border-violet-700/50',
    hoverBg: 'hover:bg-violet-50/40 dark:hover:bg-violet-900/10',
  },
  {
    label: 'Activity Logs',
    desc: 'Review login & scan history',
    path: ROUTES.ACTIVITY,
    icon: FaHistory,
    iconClass: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-200/70 dark:hover:border-amber-700/50',
    hoverBg: 'hover:bg-amber-50/40 dark:hover:bg-amber-900/10',
  },
  {
    label: 'Settings',
    desc: 'Update password & preferences',
    path: ROUTES.SETTINGS,
    icon: FaCog,
    iconClass: 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300',
    hoverBorder: 'hover:border-slate-300/70 dark:hover:border-slate-600/60',
    hoverBg: 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40',
  },
];

const QuickActionsCard = () => (
  <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 text-left">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Quick Actions
      </h3>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {actions.map((act) => (
        <Link
          key={act.label}
          to={act.path}
          className={`
            group flex flex-row sm:flex-col items-center sm:items-start gap-3 p-4
            rounded-xl border border-slate-100/80 dark:border-slate-700/40
            ${act.hoverBorder} ${act.hoverBg}
            transition-all duration-200 cursor-pointer
            hover:-translate-y-0.5 hover:shadow-sm
          `}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${act.iconClass}`}>
            <act.icon className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {act.label}
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">
              {act.desc}
            </p>
          </div>
          <FaArrowRight
            className="h-3 w-3 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200 sm:hidden shrink-0"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  </div>
);

export default QuickActionsCard;
