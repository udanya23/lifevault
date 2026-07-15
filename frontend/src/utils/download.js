/**
 * utils/download.js — Trigger browser downloads for blob API responses
 */

export const downloadBlob = (data, filename, mimeType = 'text/csv') => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
