'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronLeft, ChevronRight, Search, Check,
  Download, Sparkles, Loader2, CheckCircle2, RotateCcw,
  Eye, Users, FolderUp, PenTool, Move,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  CertConfig, EventInfo, Participant, MOCK_EVENTS, MOCK_PARTICIPANTS,
  createDefaultConfig,
} from '@/components/certificates/types';
import { renderCertificate, hitTest, HitRegion } from '@/components/certificates/canvas-renderer';
import OptionsBar from '@/components/certificates/OptionsBar';
import FloatingToolbar from '@/components/certificates/FloatingToolbar';
import SignatoriesPanel from '@/components/certificates/SignatoriesPanel';

export default function CertificatesPage() {
  const [selectedEvent, setSelectedEvent] = useState<EventInfo>(MOCK_EVENTS[0]);
  const [showEventDD, setShowEventDD]     = useState(false);
  const [participants]                     = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [search, setSearch]               = useState('');
  const [config, setConfig]               = useState<CertConfig>(
    createDefaultConfig(MOCK_EVENTS[0].title, MOCK_EVENTS[0].date)
  );
  const [previewIndex, setPreviewIndex]   = useState(0);
  const [generating, setGenerating]       = useState(false);
  const [generated, setGenerated]         = useState<string[]>([]);
  const [showSuccess, setShowSuccess]     = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeGuides, setActiveGuides] = useState<{axis: 'x'|'y', pos: number}[]>([]);
  const [selectionBox, setSelectionBox] = useState<{startX: number, startY: number, currX: number, currY: number} | null>(null);
  const [isDragging, setIsDragging]       = useState(false);
  const [showSignPanel, setShowSignPanel] = useState(false);
  const [panelHeight, setPanelHeight]     = useState(220);
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef<{ y: number; h: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitRegionsRef = useRef<HitRegion[]>([]);
  const dragStartRef = useRef<{ x: number; y: number; origins: Record<string, {x: number, y: number}> } | null>(null);

  // ── Panel resize handlers ──
  const startPanelResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    resizeStartRef.current = { y: e.clientY, h: panelHeight };
    const onMove = (ev: MouseEvent) => {
      if (!isResizingRef.current || !resizeStartRef.current) return;
      const delta = resizeStartRef.current.y - ev.clientY;
      const next = Math.max(100, Math.min(520, resizeStartRef.current.h + delta));
      setPanelHeight(next);
    };
    const onUp = () => {
      isResizingRef.current = false;
      resizeStartRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.rollNo.toLowerCase().includes(search.toLowerCase()) ||
    p.dept.toLowerCase().includes(search.toLowerCase()),
  );
  const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));
  const previewP = filtered[previewIndex] ?? participants[0];

  const patchConfig = (partial: Partial<CertConfig>) =>
    setConfig(prev => ({ ...prev, ...partial }));

  // Re-render preview
  const drawCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    const regions = await renderCertificate(
      canvasRef.current, previewP?.name ?? 'Recipient Name', config, 0.62, selectedIds, activeGuides, selectionBox
    );
    hitRegionsRef.current = regions;
  }, [previewP, config, selectedIds, activeGuides, selectionBox]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  const selectEvent = (ev: EventInfo) => {
    setSelectedEvent(ev);
    patchConfig({
      textElements: config.textElements.map(el => {
        if (el.key === 'eventName') return { ...el, text: `"${ev.title}"` };
        if (el.key === 'eventDate') return { ...el, text: `Held on ${ev.date}` };
        return el;
      }),
    });
    setShowEventDD(false);
  };

  // ── Canvas mouse handlers for drag ──
  const canvasToPercent = (clientX: number, clientY: number) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const sx = c.width / rect.width;
    const sy = c.height / rect.height;
    return { px: ((clientX - rect.left) * sx / c.width) * 100, py: ((clientY - rect.top) * sy / c.height) * 100 };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const sx = c.width / rect.width;
    const sy = c.height / rect.height;
    const cx = (e.clientX - rect.left) * sx;
    const cy = (e.clientY - rect.top) * sy;
    const hit = hitTest(hitRegionsRef.current, cx, cy);

    if (hit) {
      let newSelection = [...selectedIds];
      if (e.shiftKey) {
        if (newSelection.includes(hit.id)) {
          newSelection = newSelection.filter(id => id !== hit.id);
        } else {
          newSelection.push(hit.id);
        }
      } else {
        if (!newSelection.includes(hit.id)) {
          newSelection = [hit.id];
        }
      }
      setSelectedIds(newSelection);
      setIsDragging(true);

      const origins: Record<string, {x: number, y: number}> = {};
      newSelection.forEach(id => {
         const el = config.textElements.find(te => te.id === id);
         if (el) origins[id] = { x: el.x, y: el.y };
         else if (id === 'seal') origins[id] = { x: config.sealX, y: config.sealY };
         else if (id === 'logo') origins[id] = { x: config.logoX ?? 4.63, y: config.logoY ?? 7.05 };
         else {
            const sigI = config.signatories.findIndex(s => s.id === id);
            if (sigI >= 0) {
               const sig = config.signatories[sigI];
               const defaultX = 100 * (sigI + 1) / (config.signatories.length + 1);
               origins[id] = { x: sig.x ?? defaultX, y: sig.y ?? 72 };
            }
         }
      });
      dragStartRef.current = { x: e.clientX, y: e.clientY, origins };
    } else {
      setSelectedIds([]);
      setSelectionBox({ startX: cx, startY: cy, currX: cx, currY: cy });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !selectionBox) return;
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const sx = c.width / rect.width;
    const sy = c.height / rect.height;
    const cx = (e.clientX - rect.left) * sx;
    const cy = (e.clientY - rect.top) * sy;

    if (selectionBox) {
      setSelectionBox(prev => ({ ...prev!, currX: cx, currY: cy }));
      const xMin = Math.min(selectionBox.startX, cx);
      const xMax = Math.max(selectionBox.startX, cx);
      const yMin = Math.min(selectionBox.startY, cy);
      const yMax = Math.max(selectionBox.startY, cy);
      
      const newSelectedIds = hitRegionsRef.current
        .filter(r => {
           // Intersects?
           return r.x < xMax && (r.x + r.w) > xMin && r.y < yMax && (r.y + r.h) > yMin;
        })
        .map(r => r.id);
      
      setSelectedIds(newSelectedIds);
      return;
    }

    if (!dragStartRef.current || selectedIds.length === 0) return;
    
    const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    
    let nextConfig = { ...config };
    const origins = dragStartRef.current.origins;
    
    let guides: {axis: 'x'|'y', pos: number}[] = [];
    
    selectedIds.forEach((id, index) => {
        const orig = origins[id];
        if (!orig) return;
        let newX = orig.x + dx;
        let newY = orig.y + dy;
        
        // Snapping logic only if dragging a single element or using it as anchor
        if (selectedIds.length === 1 && !e.shiftKey) {
            if (Math.abs(newX - 50) < 1.2) { newX = 50; guides.push({ axis: 'x', pos: 50 }); }
            if (Math.abs(newY - 50) < 1.2) { newY = 50; guides.push({ axis: 'y', pos: 50 }); }
        }
        
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));
        
        if (id === 'seal') {
            nextConfig.sealX = newX; nextConfig.sealY = newY;
        } else if (id === 'logo') {
            nextConfig.logoX = newX; nextConfig.logoY = newY;
        } else {
            const isText = nextConfig.textElements.findIndex(te => te.id === id);
            if (isText >= 0) {
                nextConfig.textElements = [...nextConfig.textElements];
                nextConfig.textElements[isText] = { ...nextConfig.textElements[isText], x: newX, y: newY };
            } else {
                const sigI = nextConfig.signatories.findIndex(s => s.id === id);
                if (sigI >= 0) {
                    nextConfig.signatories = [...nextConfig.signatories];
                    nextConfig.signatories[sigI] = { ...nextConfig.signatories[sigI], x: newX, y: newY };
                }
            }
        }
    });
    
    setActiveGuides(guides);
    setConfig(nextConfig);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
    setActiveGuides([]);
    setSelectionBox(null);
  };

  // ── Scroll wheel to resize ──
  const handleCanvasWheel = (e: React.WheelEvent) => {
    if (selectedIds.length === 0) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    
    let nextConfig = { ...config };
    selectedIds.forEach(id => {
      if (id === 'seal') {
        nextConfig.sealScale = Math.max(0.5, Math.min(3, (nextConfig.sealScale || 1) + delta * 0.1));
      } else if (id === 'logo') {
        nextConfig.logoScale = Math.max(0.5, Math.min(3, (nextConfig.logoScale || 1) + delta * 0.1));
      } else {
        const isSignatory = nextConfig.signatories.some(s => s.id === id);
        if (isSignatory) {
          nextConfig.signatories = nextConfig.signatories.map(s =>
            s.id === id ? { ...s, scale: Math.max(0.5, Math.min(3, (s.scale || 1) + delta * 0.1)) } : s
          );
        } else {
          nextConfig.textElements = nextConfig.textElements.map(el =>
            el.id === id ? { ...el, fontSize: Math.max(6, Math.min(80, el.fontSize + delta)) } : el
          );
        }
      }
    });
    setConfig(nextConfig);
  };

  // ── Downloads ──
  const downloadSingle = async (p: Participant) => {
    const c = document.createElement('canvas');
    await renderCertificate(c, p.name, config, 1);
    const link = document.createElement('a');
    link.download = `${p.name.replace(/\s+/g, '-')}-certificate.png`;
    link.href = c.toDataURL('image/png');
    link.click();
  };

  const downloadAllZip = async () => {
    if (selected.size === 0) return;
    setDownloadingAll(true);
    const zip = new JSZip();
    const targets = participants.filter(p => selected.has(p.id));
    for (const p of targets) {
      const c = document.createElement('canvas');
      await renderCertificate(c, p.name, config, 1);
      const base64 = c.toDataURL('image/png').split(',')[1];
      zip.file(`${p.name.replace(/\s+/g, '-')}-certificate.png`, base64, { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${selectedEvent.title.replace(/\s+/g, '-')}-certificates.zip`;
    a.click();
    setDownloadingAll(false);
  };

  const generateBulk = async () => {
    if (selected.size === 0) return;
    setGenerating(true); setGenerated([]);
    const targets = participants.filter(p => selected.has(p.id));
    for (const t of targets) {
      await new Promise(r => setTimeout(r, 250));
      setGenerated(prev => [...prev, t.id]);
    }
    setGenerating(false); setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3500);
  };

  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(p => p.id)));

  return (
    <div style={{ height: '100vh', overflow: 'hidden', backgroundColor: '#0F1117', color: '#fff',
      fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
      display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP BAR ── */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        {/* Left: Event selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowEventDD(!showEventDD)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                border: 'none', cursor: 'pointer', padding: 0 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>{selectedEvent.title}</h1>
              <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
            </button>
            <AnimatePresence>
              {showEventDD && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  style={{ position: 'absolute', top: '110%', left: 0, backgroundColor: '#1a1d27',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden',
                    zIndex: 50, minWidth: 260, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                  {MOCK_EVENTS.map(ev => (
                    <button key={ev.id} onClick={() => selectEvent(ev)}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between',
                        padding: '10px 14px', background: ev.id === selectedEvent.id ? 'rgba(99,102,241,0.12)' : 'none',
                        border: 'none', cursor: 'pointer', color: '#fff', fontSize: 13, textAlign: 'left' }}>
                      <span style={{ fontWeight: 600 }}>{ev.title}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{ev.date}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
            letterSpacing: '0.1em' }}>Certificate Editor</span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setShowSignPanel(!showSignPanel)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
              borderRadius: 8, background: showSignPanel ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${showSignPanel ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: showSignPanel ? '#818CF8' : 'rgba(255,255,255,0.5)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <PenTool size={12} /> Signatories
          </button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: '7px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {selected.size > 0 ? <><span style={{ color: '#818CF8', fontWeight: 700 }}>{selected.size}</span> sel</> : '—'}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={downloadAllZip} disabled={selected.size === 0 || downloadingAll}
            style={actionBtn(selected.size > 0, '#10B981')}>
            {downloadingAll ? <Loader2 size={13} className="spin" /> : <Download size={13} />} ZIP
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => alert('Google Drive: Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local')}
            style={actionBtn(false, '#60a5fa')}>
            <FolderUp size={13} /> Drive
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={generateBulk} disabled={selected.size === 0 || generating}
            style={{
              ...actionBtn(selected.size > 0, '#6366F1'),
              background: selected.size > 0 ? 'linear-gradient(135deg,#6366F1,#818CF8)' : undefined,
              color: selected.size > 0 ? '#fff' : undefined,
            }}>
            {generating ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />} Generate
          </motion.button>
        </div>
      </div>

      {/* ── OPTIONS BAR ── */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <OptionsBar config={config} onChange={patchConfig} />
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: '10px 24px', background: 'rgba(16,185,129,0.08)', borderBottom: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#34d399' }}>
            <CheckCircle2 size={14} /> {selected.size} certificates generated!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT: Canvas + optional Sign panel ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Canvas area */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '24px',
          background: 'repeating-conic-gradient(rgba(255,255,255,0.012) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px' }}>

          {/* Floating toolbar */}
          <AnimatePresence>
            {selectedIds.length === 1 && config.textElements.find(e => e.id === selectedIds[0]) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                style={{ position: 'absolute', top: 16, zIndex: 20 }}>
                <FloatingToolbar config={config} elementId={selectedIds[0]} onChange={patchConfig} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canvas */}
          <canvas ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onWheel={handleCanvasWheel}
            style={{
              borderRadius: 8,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              maxWidth: '100%', maxHeight: 'calc(100vh - 320px)',
              cursor: isDragging ? 'grabbing' : selectedIds.length > 0 ? 'grab' : 'crosshair',
              userSelect: 'none',
            }}
          />

          {/* Action/hint bar */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 24,
            background: 'rgba(15,17,23,0.6)', padding: '8px 16px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Move size={10} /> Drag to move
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
              Scroll wheel to resize
            </span>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
            {/* Preview nav */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => setPreviewIndex(i => Math.max(0, i - 1))} disabled={previewIndex === 0}
                style={navBtn(previewIndex === 0)}><ChevronLeft size={12} /></button>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', minWidth: 50, textAlign: 'center', fontWeight: 600 }}>
                {previewIndex + 1}/{Math.max(filtered.length, 1)}</span>
              <button onClick={() => setPreviewIndex(i => Math.min(filtered.length - 1, i + 1))}
                disabled={previewIndex >= filtered.length - 1}
                style={navBtn(previewIndex >= filtered.length - 1)}><ChevronRight size={12} /></button>
            </div>
            {previewP && (
              <>
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
                <button onClick={() => downloadSingle(previewP)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px',
                    borderRadius: 6, background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Download size={10} /> Download PNG
                </button>
              </>
            )}
          </div>
        </div>

        {/* Signatories side panel */}
        <AnimatePresence>
          {showSignPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)',
                overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SignatoriesPanel config={config} onChange={patchConfig} selectedSignatoryId={selectedIds.length === 1 ? selectedIds[0] : null} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM: Participants ── */}
      {/* Resize handle */}
      <div
        onMouseDown={startPanelResize}
        title="Drag to resize"
        style={{
          height: 6, cursor: 'row-resize', flexShrink: 0,
          background: 'rgba(255,255,255,0.04)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
          userSelect: 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.18)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
      >
        <div style={{ width: 36, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
      </div>
      <div style={{ height: panelHeight, overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)',
          position: 'sticky', top: 0, zIndex: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={13} color="#10B981" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Participants</span>
            <span style={{ padding: '1px 6px', background: 'rgba(16,185,129,0.12)', borderRadius: 5,
              fontSize: 10, fontWeight: 700, color: '#10B981' }}>{participants.length}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={12} color="rgba(255,255,255,0.25)"
                style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                style={{ paddingLeft: 26, paddingRight: 8, paddingTop: 5, paddingBottom: 5,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6, color: '#fff', fontSize: 11, outline: 'none', width: 140 }} />
            </div>
            <button onClick={toggleAll}
              style={{ fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 6,
                background: allSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${allSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)'}`,
                color: allSelected ? '#818CF8' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Compact rows */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 0 }}>
          {filtered.map((p, i) => {
            const isSel = selected.has(p.id);
            const isDone = generated.includes(p.id);
            return (
              <div key={p.id}
                onClick={() => { toggleSelect(p.id); setPreviewIndex(i); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 24px',
                  cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: isSel ? 'rgba(99,102,241,0.06)' : 'transparent',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => !isSel && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => !isSel && (e.currentTarget.style.background = 'transparent')}>
                <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${isSel ? '#6366F1' : 'rgba(255,255,255,0.15)'}`,
                  background: isSel ? '#6366F1' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isSel && <Check size={9} color="#fff" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{p.name}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 6 }}>{p.rollNo}</span>
                </div>
                {isDone && <CheckCircle2 size={12} color="#10B981" />}
                <button onClick={e => { e.stopPropagation(); downloadSingle(p); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px',
                    borderRadius: 5, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)',
                    fontSize: 10, cursor: 'pointer' }}>
                  <Download size={9} /> PNG
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlays */}
      {showEventDD && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowEventDD(false)} />}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}`}</style>
    </div>
  );
}

function actionBtn(active: boolean, color: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
    borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: active ? 'pointer' : 'not-allowed',
    background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
    border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
    color: active ? color : 'rgba(255,255,255,0.3)',
  };
}

function navBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 22, height: 22, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)', cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
  };
}
