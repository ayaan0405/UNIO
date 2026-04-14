'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronLeft, ChevronRight, Search, Check,
  Download, Sparkles, Loader2, CheckCircle2,
  Users, FolderUp,
} from 'lucide-react';
import JSZip from 'jszip';
import { EventInfo, Participant, MOCK_EVENTS, MOCK_PARTICIPANTS } from '@/components/certificates/types';
import { FabricProvider, useFabric } from '@/components/certificates/fabric-editor';
import FabricCanvas from '@/components/certificates/fabric-editor/FabricCanvas';
import EditorToolbar from '@/components/certificates/fabric-editor/Toolbar';
import PropertiesPanel from '@/components/certificates/fabric-editor/PropertiesPanel';
import TemplatesSidebar, { AccordionSection } from '@/components/certificates/fabric-editor/TemplatesSidebar';

function CertificatesContent() {
  const [selectedEvent, setSelectedEvent] = useState<EventInfo>(MOCK_EVENTS[0]);
  const [showEventDD, setShowEventDD] = useState(false);
  const [participants] = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const { canvas, loadJSON, pushHistory, refreshLayers } = useFabric();
  const hiddenCanvasElRef = useRef<HTMLCanvasElement>(null);

  // Initial load of default template (Classic Indigo)
  useEffect(() => {
    if (!canvas) return;
    import('@/components/certificates/fabric-editor/templates-data').then(({ CERT_TEMPLATES }) => {
      const defaultTemplate = CERT_TEMPLATES[0];
      loadJSON(defaultTemplate.fabricJSON);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.rollNo.toLowerCase().includes(search.toLowerCase()) ||
    p.dept.toLowerCase().includes(search.toLowerCase()),
  );
  const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));
  const previewP = filtered[previewIndex] ?? participants[0];

  const selectEvent = (ev: EventInfo) => {
    setSelectedEvent(ev);
    setShowEventDD(false);
    // Optionally update the canvas eventname and date
    if (canvas) {
      canvas.getObjects().forEach((obj: any) => {
        if (obj.__uid === 'event_name') obj.set('text', `"${ev.title}"`);
        if (obj.__uid === 'event_date') obj.set('text', `Held on ${ev.date}`);
      });
      canvas.renderAll();
      pushHistory();
      refreshLayers();
    }
  };

  const getExportCanvas = async () => {
    if (!canvas || !hiddenCanvasElRef.current) return null;
    const { Canvas } = await import('fabric');
    const exportCanvas = new Canvas(hiddenCanvasElRef.current, { width: 1123, height: 794 });
    const json = canvas.toJSON(['__uid', 'name']);
    await exportCanvas.loadFromJSON(json);
    return exportCanvas;
  };

  const downloadSingle = async (p: Participant) => {
    const exportCanvas = await getExportCanvas();
    if (!exportCanvas) return;

    exportCanvas.getObjects().forEach((obj: any) => {
      if (obj.__uid === 'recipient_name' || obj.text?.includes('Recipient Name')) {
        obj.set('text', p.name);
      }
    });
    exportCanvas.renderAll();

    const dataURL = exportCanvas.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.download = `${p.name.replace(/\s+/g, '-')}-certificate.png`;
    link.href = dataURL;
    link.click();
    exportCanvas.dispose();
  };

  const downloadAllZip = async () => {
    if (selected.size === 0) return;
    setDownloadingAll(true);
    const zip = new JSZip();
    const targets = participants.filter(p => selected.has(p.id));

    const exportCanvas = await getExportCanvas();
    if (!exportCanvas) {
      setDownloadingAll(false);
      return;
    }

    for (const p of targets) {
      exportCanvas.getObjects().forEach((obj: any) => {
        if (obj.__uid === 'recipient_name' || obj.text?.includes('Recipient Name')) {
          obj.set('text', p.name);
        }
      });
      exportCanvas.renderAll();
      const base64 = exportCanvas.toDataURL({ format: 'png', multiplier: 2 }).split(',')[1];
      zip.file(`${p.name.replace(/\s+/g, '-')}-certificate.png`, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${selectedEvent.title.replace(/\s+/g, '-')}-certificates.zip`;
    a.click();
    exportCanvas.dispose();
    setDownloadingAll(false);
  };

  const generateBulk = async () => {
    if (selected.size === 0) return;
    setGenerating(true); setGenerated([]);
    const targets = participants.filter(p => selected.has(p.id));
    for (const t of targets) {
      await new Promise(r => setTimeout(r, 250)); // Simulating API call/generation
      setGenerated(prev => [...prev, t.id]);
    }
    setGenerating(false); setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3500);
  };

  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(p => p.id)));

  // Update preview on selection if previewP changes (just for UI, though Fabric canvas is the "master")
  useEffect(() => {
    if (canvas && previewP) {
      let changed = false;
      canvas.getObjects().forEach((obj: any) => {
        if (obj.__uid === 'recipient_name') {
          if (obj.text !== previewP.name && obj.text !== 'Recipient Name') {
            obj.set('text', previewP.name);
            changed = true;
          }
        }
      });
      if (changed) {
        canvas.renderAll();
      }
    }
  }, [previewP, canvas]);


  return (
    <div style={{
      height: '100vh', overflow: 'hidden', backgroundColor: '#0F1117', color: '#fff',
      fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
      display: 'flex', flexDirection: 'column'
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowEventDD(!showEventDD)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                border: 'none', cursor: 'pointer', padding: 0
              }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>{selectedEvent.title}</h1>
              <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
            </button>
            <AnimatePresence>
              {showEventDD && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  style={{
                    position: 'absolute', top: '110%', left: 0, backgroundColor: '#1a1d27',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden',
                    zIndex: 50, minWidth: 260, boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
                  }}>
                  {MOCK_EVENTS.map(ev => (
                    <button key={ev.id} onClick={() => selectEvent(ev)}
                      style={{
                        width: '100%', display: 'flex', justifyItems: 'space-between',
                        padding: '10px 14px', background: ev.id === selectedEvent.id ? 'rgba(99,102,241,0.12)' : 'none',
                        border: 'none', cursor: 'pointer', color: '#fff', fontSize: 13, textAlign: 'left',
                        justifyContent: 'space-between'
                      }}>
                      <span style={{ fontWeight: 600 }}>{ev.title}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{ev.date}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span style={{
            fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>Fabric.js Editor</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: '7px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'
          }}>
            {selected.size > 0 ? <><span style={{ color: '#818CF8', fontWeight: 700 }}>{selected.size}</span> sel</> : '—'}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={downloadAllZip} disabled={selected.size === 0 || downloadingAll}
            style={actionBtn(selected.size > 0, '#10B981')}>
            {downloadingAll ? <Loader2 size={13} className="spin" /> : <Download size={13} />} ZIP
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => alert('Google Drive stub')}
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

      {showSuccess && (
        <div style={{
          padding: '10px 24px', background: 'rgba(16,185,129,0.08)', borderBottom: '1px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#34d399'
        }}>
          <CheckCircle2 size={14} /> {selected.size} certificates generated!
        </div>
      )}

      {/* ── EDITOR AREA (3 Columns) ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Left Sidebar (Width 280) - Attributes & Participants */}
        <div style={{ width: 280, backgroundColor: '#2B2D30', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          <div style={{ flexShrink: 0 }}>
            {/* The properties panel renders its own flex box but we can wrap it */}
            <PropertiesPanel />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AccordionSection title="Participants" icon={<Users size={14} />}>
              <div style={{ padding: '0 8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {selected.size} selected
                  </span>
                  <button onClick={toggleAll}
                    style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                      background: allSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${allSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)'}`,
                      color: allSelected ? '#818CF8' : 'rgba(255,255,255,0.4)', cursor: 'pointer'
                    }}>
                    {allSelected ? 'Deselect' : 'Select All'}
                  </button>
                </div>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <Search size={12} color="rgba(255,255,255,0.25)"
                    style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search participants…"
                    style={{
                      paddingLeft: 26, paddingRight: 8, paddingTop: 6, paddingBottom: 6,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 4, color: '#fff', fontSize: 11, outline: 'none', width: '100%'
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {filtered.map((p, i) => {
                    const isSel = selected.has(p.id);
                    const isDone = generated.includes(p.id);
                    return (
                      <div key={p.id}
                        onClick={() => { toggleSelect(p.id); setPreviewIndex(i); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                          cursor: 'pointer', borderRadius: 6,
                          background: isSel ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.01)',
                          border: `1px solid ${isSel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)'}`,
                        }}>
                        <div style={{
                          width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                          border: `1px solid ${isSel ? '#818CF8' : 'rgba(255,255,255,0.2)'}`,
                          background: isSel ? '#818CF8' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {isSel && <Check size={8} color="#1E1E2E" strokeWidth={3} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: isSel ? '#fff' : 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{p.rollNo}</span>
                        </div>
                        {isDone && <CheckCircle2 size={12} color="#10B981" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </AccordionSection>
          </div>
        </div>

        {/* Center Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <EditorToolbar />
          <FabricCanvas width={1123} height={794} />

          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            {/* Preview nav */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => setPreviewIndex(i => Math.max(0, i - 1))} disabled={previewIndex === 0}
                style={navBtn(previewIndex === 0)}><ChevronLeft size={12} /></button>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', minWidth: 60, textAlign: 'center', fontWeight: 600 }}>
                {previewIndex + 1}/{Math.max(filtered.length, 1)}</span>
              <button onClick={() => setPreviewIndex(i => Math.min(filtered.length - 1, i + 1))}
                disabled={previewIndex >= filtered.length - 1}
                style={navBtn(previewIndex >= filtered.length - 1)}><ChevronRight size={12} /></button>
            </div>
            {previewP && (
              <button onClick={() => downloadSingle(previewP)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px',
                  borderRadius: 6, background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                }}>
                <Download size={11} /> Download PNG
              </button>
            )}
          </div>
        </div>

        {/* Right Panel (Templates, Shapes, Layers) */}
        <div style={{ width: 280, backgroundColor: '#2B2D30', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          <TemplatesSidebar />
        </div>

      </div>

      <canvas ref={hiddenCanvasElRef} style={{ display: 'none' }} />
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
    width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)', cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
  };
}

export default function CertificatesPage() {
  return (
    <FabricProvider>
      <CertificatesContent />
    </FabricProvider>
  );
}
