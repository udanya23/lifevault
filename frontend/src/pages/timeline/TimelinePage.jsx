/**
 * pages/timeline/TimelinePage.jsx — Health Timeline
 *
 * Chronological health events with filters, month grouping,
 * infinite scroll, and file attachments.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaDownload,
  FaFilePdf,
  FaFileImage,
  FaSpinner,
  FaHistory,
} from 'react-icons/fa';

import {
  fetchTimelineEvents,
  fetchTimelineYears,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
  setTimelineFilters,
  resetTimelineEvents,
  selectTimelineEvents,
  selectTimelineMeta,
  selectTimelineYears,
  selectTimelineFilters,
  selectTimelineLoading,
  selectTimelineLoadingMore,
  selectTimelineSubmitting,
} from '@/features/timeline/timelineSlice';
import { TIMELINE_CATEGORIES, getTimelineCategoryMeta } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import TimelineEventModal from '@/components/timeline/TimelineEventModal';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Input from '@/components/common/Input';

const CATEGORY_STRIPE = {
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  red: 'bg-red-500',
  emerald: 'bg-emerald-500',
  cyan: 'bg-cyan-500',
  violet: 'bg-violet-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-500',
};

const CATEGORY_BADGE = {
  blue: 'primary',
  indigo: 'primary',
  red: 'danger',
  emerald: 'success',
  cyan: 'info',
  violet: 'primary',
  orange: 'warning',
  teal: 'info',
  amber: 'warning',
  rose: 'danger',
  slate: 'default',
};

const groupEventsByMonth = (events) => {
  const groups = {};
  events.forEach((event) => {
    const d = new Date(event.eventDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = { key, label, events: [] };
    groups[key].events.push(event);
  });
  return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
};

const TimelinePage = () => {
  const dispatch = useDispatch();
  const events = useSelector(selectTimelineEvents);
  const meta = useSelector(selectTimelineMeta);
  const years = useSelector(selectTimelineYears);
  const filters = useSelector(selectTimelineFilters);
  const isLoading = useSelector(selectTimelineLoading);
  const isLoadingMore = useSelector(selectTimelineLoadingMore);
  const isSubmitting = useSelector(selectTimelineSubmitting);

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const loadMoreRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const loadFirstPage = useCallback(() => {
    dispatch(resetTimelineEvents());
    dispatch(
      fetchTimelineEvents({
        page: 1,
        limit: 15,
        year: filters.year || undefined,
        category: filters.category || undefined,
        search: filters.search || undefined,
        append: false,
      })
    );
  }, [dispatch, filters.year, filters.category, filters.search]);

  useEffect(() => {
    dispatch(fetchTimelineYears());
    loadFirstPage();
  }, [dispatch, loadFirstPage]);

  useEffect(() => {
    if (!loadMoreRef.current || !meta.hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && meta.hasMore && !isLoadingMore && !isLoading) {
          dispatch(
            fetchTimelineEvents({
              page: meta.page + 1,
              limit: meta.limit,
              year: filters.year || undefined,
              category: filters.category || undefined,
              search: filters.search || undefined,
              append: true,
            })
          );
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [dispatch, meta, filters, isLoading, isLoadingMore]);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      dispatch(setTimelineFilters({ search: value.trim() }));
    }, 400);
  };

  const grouped = useMemo(() => groupEventsByMonth(events), [events]);

  const toggleMonth = (key) => {
    setCollapsedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openCreate = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    let result;
    if (editingEvent) {
      result = await dispatch(updateTimelineEvent({ id: editingEvent._id, formData }));
    } else {
      result = await dispatch(createTimelineEvent(formData));
    }

    if (createTimelineEvent.fulfilled.match(result) || updateTimelineEvent.fulfilled.match(result)) {
      toast.success(editingEvent ? 'Timeline event updated.' : 'Timeline event added.');
      setModalOpen(false);
      loadFirstPage();
    } else {
      toast.error(result.payload?.message || 'Could not save event.');
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm('Delete this timeline event?')) return;
    const result = await dispatch(deleteTimelineEvent(event._id));
    if (deleteTimelineEvent.fulfilled.match(result)) {
      toast.success('Timeline event deleted.');
    } else {
      toast.error(result.payload?.message || 'Delete failed.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-left"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Health Timeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your complete chronological health history — visits, tests, surgeries, and more.
          </p>
        </div>
        <Button icon={FaPlus} onClick={openCreate} size="sm">
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <Card padding="md" className="border-slate-200/80 dark:border-slate-700/60">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              label="Search"
              placeholder="Doctor, hospital, notes…"
              icon={FaSearch}
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Year</label>
            <select
              value={filters.year}
              onChange={(e) => dispatch(setTimelineFilters({ year: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
            >
              <option value="">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Category</label>
            <select
              value={filters.category}
              onChange={(e) => dispatch(setTimelineFilters({ category: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
            >
              <option value="">All categories</option>
              {TIMELINE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <FaHistory className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No timeline events yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Start building your health history by adding your first event.</p>
          <Button variant="outline" icon={FaPlus} onClick={openCreate}>Add First Event</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => {
            const collapsed = collapsedMonths[group.key];
            return (
              <section key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleMonth(group.key)}
                  className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  {collapsed ? <FaChevronDown className="h-3 w-3" /> : <FaChevronUp className="h-3 w-3" />}
                  {group.label}
                  <span className="text-xs font-semibold text-slate-400">({group.events.length})</span>
                </button>

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {group.events.map((event) => {
                        const cat = getTimelineCategoryMeta(event.category);
                        return (
                          <Card
                            key={event._id}
                            padding="md"
                            className="relative border-slate-200/80 dark:border-slate-700/60 overflow-hidden"
                          >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${CATEGORY_STRIPE[cat.color] || 'bg-slate-500'}`} aria-hidden="true" />
                            <div className="flex justify-between gap-3 pl-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <Badge variant={CATEGORY_BADGE[cat.color] || 'default'} size="sm">
                                    {cat.label}
                                  </Badge>
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    {formatDate(event.eventDate, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {event.eventType || cat.label}
                                </h3>
                                {(event.doctor || event.hospital) && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {[event.doctor, event.hospital].filter(Boolean).join(' · ')}
                                  </p>
                                )}
                                {event.description && (
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                                    {event.description}
                                  </p>
                                )}
                                {event.notes && (
                                  <p className="text-[11px] text-slate-400 mt-1 italic">{event.notes}</p>
                                )}

                                {event.attachments?.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {event.attachments.map((file) => (
                                      <a
                                        key={file._id}
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                      >
                                        {file.mimeType?.includes('pdf') ? (
                                          <FaFilePdf className="h-3 w-3" />
                                        ) : (
                                          <FaFileImage className="h-3 w-3" />
                                        )}
                                        {file.name}
                                        <FaDownload className="h-2.5 w-2.5 opacity-60" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => openEdit(event)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                  aria-label="Edit event"
                                >
                                  <FaEdit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(event)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                  aria-label="Delete event"
                                >
                                  <FaTrash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            );
          })}

          <div ref={loadMoreRef} className="py-4 flex justify-center">
            {isLoadingMore && <FaSpinner className="h-6 w-6 text-blue-600 animate-spin" />}
            {!meta.hasMore && events.length > 0 && (
              <p className="text-xs text-slate-400">End of timeline</p>
            )}
          </div>
        </div>
      )}

      <TimelineEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        event={editingEvent}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  );
};

export default TimelinePage;
