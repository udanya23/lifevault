/**
 * printWalletCard — open a print-ready page for the emergency wallet card
 * User can print to paper or "Save as PDF" from the browser dialog.
 */

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * @param {object} options
 * @param {string} options.name
 * @param {string} [options.bloodGroup]
 * @param {string} options.emergencyUrl
 * @param {string} options.qrDataUrl - PNG data URL from canvas
 */
export const printWalletCard = ({ name, bloodGroup, emergencyUrl, qrDataUrl }) => {
  const bloodLabel =
    bloodGroup && bloodGroup !== 'unknown' ? bloodGroup : 'Not set';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>LifeVault Emergency Card — ${escapeHtml(name)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background: #f1f5f9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .hint {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 20px;
      text-align: center;
      max-width: 400px;
      line-height: 1.5;
    }
    .card {
      width: 3.375in;
      height: 2.125in;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: #fff;
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.12);
    }
    .card-header {
      height: 0.42in;
      background: linear-gradient(90deg, #2563eb, #4f46e5);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      color: #fff;
    }
    .brand { font-size: 11px; font-weight: 800; letter-spacing: -0.02em; }
    .badge {
      font-size: 7px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background: #dc2626;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .card-body {
      display: flex;
      height: calc(2.125in - 0.42in);
      padding: 10px 14px;
      gap: 10px;
    }
    .info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }
    .label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; }
    .name { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .blood { font-size: 9px; color: #64748b; margin-top: 4px; font-weight: 600; }
    .blood span { color: #dc2626; font-weight: 800; }
    .footnote { font-size: 6.5px; color: #94a3b8; line-height: 1.35; }
    .url { font-size: 5.5px; color: #cbd5e1; word-break: break-all; margin-top: 3px; font-family: ui-monospace, monospace; }
    .qr-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .qr-wrap img { width: 0.95in; height: 0.95in; border: 1px solid #f1f5f9; border-radius: 6px; }
    .scan { font-size: 6px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-top: 3px; letter-spacing: 0.05em; }
    @media print {
      body { background: #fff; padding: 0; min-height: auto; }
      .hint { display: none; }
      .card { box-shadow: none; margin: 0 auto; page-break-inside: avoid; }
      @page { margin: 0.5in; size: letter; }
    }
  </style>
</head>
<body>
  <p class="hint">Print this card and keep it in your wallet. Use &ldquo;Save as PDF&rdquo; in the print dialog to download a digital copy.</p>
  <div class="card">
    <div class="card-header">
      <span class="brand">&#128274; LifeVault</span>
      <span class="badge">Emergency</span>
    </div>
    <div class="card-body">
      <div class="info">
        <div>
          <p class="label">In case of emergency</p>
          <p class="name">${escapeHtml(name)}</p>
          <p class="blood">Blood group: <span>${escapeHtml(bloodLabel)}</span></p>
        </div>
        <div>
          <p class="footnote">Scan QR for allergies, medications &amp; emergency contacts.</p>
          <p class="url">${escapeHtml(emergencyUrl)}</p>
        </div>
      </div>
      <div class="qr-wrap">
        <img src="${qrDataUrl}" alt="Emergency QR code" />
        <span class="scan">Scan me</span>
      </div>
    </div>
  </div>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 300);
    });
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=720,height=520');
  if (!printWindow) {
    throw new Error('Pop-up blocked. Please allow pop-ups to print your wallet card.');
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};

/**
 * Capture QR code from a canvas element as PNG data URL.
 */
export const getQrDataUrlFromCanvas = (canvas) => {
  if (!canvas) return null;
  return canvas.toDataURL('image/png');
};
