/**
 * components/common/TagInput.jsx — Premium Tag Input Component
 *
 * Premium:
 * - Rounded input capsule with deep focus indicator
 * - Polished animated tag pills with hover delete controls
 * - Quick add button animation
 */

import { useState, useId } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

const TagInput = ({
  label,
  tags = [],
  onChange,
  placeholder = 'Type and press Enter or Comma',
  error,
  helperText,
  className = '',
  maxTags = 15,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputId = useId();

  const addTag = (tagText) => {
    const cleanTag = tagText.trim().replace(/^[,\s]+|[,\s]+$/g, '');

    if (!cleanTag) return;
    if (tags.includes(cleanTag)) {
      setInputValue('');
      return;
    }
    if (tags.length >= maxTags) {
      setInputValue('');
      return;
    }

    const updatedTags = [...tags, cleanTag];
    onChange(updatedTags);
    setInputValue('');
  };

  const removeTag = (indexToRemove) => {
    const updatedTags = tags.filter((_, idx) => idx !== indexToRemove);
    onChange(updatedTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleBlur = () => {
    addTag(inputValue);
  };

  return (
    <div className={`flex flex-col w-full text-left gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold tracking-wide text-slate-650 dark:text-slate-400 select-none"
        >
          {label} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">({tags.length}/{maxTags})</span>
        </label>
      )}

      {/* Input container surface */}
      <div
        className={`
          flex flex-wrap items-center gap-2 p-2 rounded-xl border text-sm transition-all duration-200
          bg-white dark:bg-slate-900/80
          ${
            error
              ? 'border-red-400 dark:border-red-500 ring-2 ring-red-400/20 dark:ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-400/30'
              : 'border-slate-200 dark:border-slate-700/80 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/15 dark:focus-within:ring-blue-400/20 hover:border-slate-300 dark:hover:border-slate-600'
          }
          min-h-[46px]
        `}
      >
        {/* Render tags */}
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-450 border border-blue-100/60 dark:border-blue-800/40 transition-all duration-150 hover:bg-blue-100 dark:hover:bg-blue-900/50"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-850 text-blue-500 hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <FaTimes className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
            </button>
          </span>
        ))}

        {/* Input box */}
        <input
          id={inputId}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={tags.length >= maxTags}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none border-0 p-1 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm disabled:cursor-not-allowed"
        />

        {/* Quick Add Button */}
        {inputValue.trim() && (
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
            aria-label="Add tag"
          >
            <FaPlus className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Validation Errors */}
      {error && (
        <span className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400 mt-0.5 ml-1">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 ml-1">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default TagInput;
