import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { translations } from '../i18n.js';
import { api } from '../api.js';

export default function PublicPage() {
  const [lang, setLang] = useState('en');
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(new Map());
  const [overlayOpen, setOverlayOpen] = useState(false);
  const exportRef = useRef(null);
  const t = translations[lang];

  useEffect(() => {
    api.getTickets().then(setTickets).catch(() => {});
  }, []);

  const pairTickets = tickets.filter((tk) => tk.tier === 'pair');
  const singleTickets = tickets.filter((tk) => tk.tier === 'single');

  function toggle(num, isPair) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(num)) next.delete(num);
      else next.set(num, isPair);
      return next;
    });
  }

  function deselect(num) {
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(num);
      return next;
    });
  }

  async function exportImage(mode) {
    const card = exportRef.current;
    card.style.zIndex = '1';
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(card, {
      backgroundColor: '#ffffff',
      scale: Math.max(window.devicePixelRatio || 2, 2),
      width: 390,
      windowWidth: 390
    });
    card.style.zIndex = '-1';
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'lottery-numbers.png', { type: 'image/png' });
      if (mode === 'share' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Lottery Numbers' });
          return;
        } catch {
          /* fall through to save */
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lottery-numbers.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }

  return (
    <div className="sheet">
      <div className="lang-bar">
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">EN</option>
          <option value="th">TH</option>
          <option value="mm">MM</option>
        </select>
        <Link to="/login" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '6px 14px', fontSize: 13 }}>
          Admin / Login
        </Link>
      </div>

      <h1>Thai Government Lottery</h1>
      <div className="sub">
        <span>{t.drawLabel}</span> <span>{t.drawDate}</span>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="dot pair" />
          <div className="section-title">{t.pairTitle}</div>
        </div>
        <div className="section-sub">{t.pairSub}</div>
        <div className="numbers">
          {pairTickets.map((tk) => (
            <div
              key={tk.id}
              className={'num pair' + (selected.has(tk.number) ? ' selected' : '')}
              onClick={() => toggle(tk.number, true)}
            >
              {tk.number}
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="dot single" />
          <div className="section-title">{t.singleTitle}</div>
        </div>
        <div className="section-sub">{t.singleSub}</div>
        <div className="numbers">
          {singleTickets.map((tk) => (
            <div
              key={tk.id}
              className={'num' + (selected.has(tk.number) ? ' selected' : '')}
              onClick={() => toggle(tk.number, false)}
            >
              {tk.number}
            </div>
          ))}
        </div>
      </div>

      <footer>Powered By Intercontinental Passage</footer>

      <button
        className={'send-fab' + (selected.size > 0 ? ' visible' : '')}
        onClick={() => setOverlayOpen(true)}
      >
        <span>{t.sendLabel}</span>
        <span className="count">{selected.size}</span>
      </button>

      {overlayOpen && (
        <div className="overlay open" onClick={(e) => { if (e.target.classList.contains('overlay')) setOverlayOpen(false); }}>
          <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
            <div className="overlay-title">{t.overlayTitle}</div>
            <div className="overlay-list">
              {selected.size === 0 && <div className="overlay-empty">{t.emptyMsg}</div>}
              {[...selected.entries()].map(([num, isPair]) => (
                <div key={num} className={'chip' + (isPair ? ' pair' : '')}>
                  <span>{num}</span>
                  <button onClick={() => deselect(num)}>×</button>
                </div>
              ))}
            </div>
            <div className="overlay-actions">
              <button className="btn-save" onClick={() => exportImage('save')}>{t.saveBtn}</button>
              <button className="btn-share" onClick={() => exportImage('share')}>{t.shareBtn}</button>
            </div>
            <div className="overlay-hint">{t.tapHint}</div>
          </div>
        </div>
      )}

      <div id="exportCard" ref={exportRef}>
        <h2>Thai Government Lottery</h2>
        <div className="exp-sub">
          {t.drawLabel} {t.drawDate}
        </div>
        <div className="exp-grid">
          {[...selected.entries()].map(([num, isPair]) => (
            <div key={num} className={'exp-num' + (isPair ? ' pair' : '')}>{num}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
