import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, RotateCcw, Sparkles, Target, X } from "lucide-react";
import { CURRICULUM } from "../data/curriculum";
import { TERMS } from "../data/terms";
import { TIMELINE } from "../data/timeline";
import { CATEGORY_MILESTONES } from "../data/categoryMilestones";
import type { Term, UnitId } from "../data/types";
import { isSupabaseConfigured, supabase } from "../integrations/supabase/client";
import { loadLocalMastery, saveLocalMastery } from "../lib/mastery";

const eraLabel = (unitId: UnitId, year: number) => {
  if (unitId === "french-rev") {
    if (year < 1789) return "Pre-revolutionary crisis";
    if (year < 1792) return "National & Legislative Assemblies";
    if (year < 1795) return "National Convention";
    if (year < 1799) return "The Directory";
    if (year < 1814) return "Napoleonic Era";
    return "Restoration & Vienna";
  }
  return `c. ${Math.floor(year / 50) * 50}s`;
};

export default function UnitStudyPage({ unitId }: { unitId: UnitId }) {
  const unit = CURRICULUM.find((item) => item.id === unitId)!;
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"map" | "list">("map");
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [activeEvent, setActiveEvent] = useState<(typeof TIMELINE)[number] | null>(null);
  const [mastered, setMastered] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [flashcard, setFlashcard] = useState(false);
  const [blueprintOpen, setBlueprintOpen] = useState(false);
  const unitTerms = TERMS.filter((term) => term.unit === unitId);
  const masteredSet = new Set(mastered);
  const relatedTerms = activeTerm ? unitTerms.filter((term) => term.id !== activeTerm.id).slice(0, 4) : [];
  const linkedEvents = activeTerm ? [...TIMELINE, ...CATEGORY_MILESTONES].filter((event) => event.unit === unitId && event.terms.includes(activeTerm.id)).slice(0, 5) : [];
  useEffect(() => {
    let alive = true;
    const local = loadLocalMastery();
    setMastered(local);
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive || !data.session) return;
      setUserId(data.session.user.id);
      const { data: rows } = await supabase.from("user_mastery").select("term_id").eq("user_id", data.session.user.id);
      if (!alive) return;
      const merged = [...new Set([...local, ...(rows ?? []).map((row) => row.term_id)])];
      setMastered(merged);
      saveLocalMastery(merged);
    });
    return () => { alive = false; };
  }, []);
  async function toggleTermMastery(termId: string) {
    const next = masteredSet.has(termId) ? mastered.filter((id) => id !== termId) : [...mastered, termId];
    setMastered(next);
    saveLocalMastery(next);
    if (!userId) return;
    if (masteredSet.has(termId)) await supabase.from("user_mastery").delete().eq("user_id", userId).eq("term_id", termId);
    else await supabase.from("user_mastery").upsert({ user_id: userId, term_id: termId }, { onConflict: "user_id,term_id" });
  }
  const events = useMemo(() => {
    const baseEvents = TIMELINE.filter((event) => event.unit === unitId && (unitId !== "french-rev" || event.year < 1789));
    return [...baseEvents, ...CATEGORY_MILESTONES.filter((event) => event.unit === unitId)]
      .sort((a, b) => a.year - b.year)
      .filter((event) => `${event.title} ${event.label} ${event.effects}`.toLowerCase().includes(search.toLowerCase()));
  }, [unitId, search]);
  const eras = useMemo(() => [...new Set(events.map((event) => eraLabel(unitId, event.year)))], [events, unitId]);
  return <main className="unit-study">
    <header className="unit-mast"><Link to="/" className="unit-brand"><span className="unit-seal">E</span> AP European History <span>/</span> EuroWise</Link><Link to="/study-guide" className="unit-guide-link"><BookOpen size={15}/> Full study guide</Link></header>
    <section className="unit-hero"><div><div className="unit-kicker">{unit.era} · CATEGORY {String(CURRICULUM.indexOf(unit) + 1).padStart(2, "0")}</div><h1>{unit.title}</h1><p>{unit.summary} Open a milestone for causes, consequences, and connected terms. Use the key concepts below to review the tracked vocabulary.</p></div><aside className="unit-hero-note"><b>IN THIS CATEGORY</b>{unitTerms.length} tracked terms · {unitTerms.filter((term) => masteredSet.has(term.id)).length} mastered<br/>{events.length} timeline milestones</aside></section>
    <section className="unit-toolbar"><div className="unit-filters"><label className="sr-only" htmlFor="unit-search">Filter milestones</label><input id="unit-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter milestones…"/><div className="unit-view-switch"><button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>Era map</button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>Timeline list</button></div></div><span className="unit-toolbar-note">SELECT A MILESTONE TO OPEN ITS DETAIL</span></section>
    <div className="unit-legend"><b>THEMES</b><span><i className="unit-swatch blue"/> Political / intellectual</span><span><i className="unit-swatch green"/> Social / cultural</span><span><i className="unit-swatch gold"/> Economic / state</span></div>
    <section className="unit-timeline-head"><h2>Milestones</h2><span>{events.length} connected events · {unit.era}</span></section>
    {view === "map" ? <div className="unit-era-map">{eras.map((era) => { const group = events.filter((event) => eraLabel(unitId, event.year) === era); return <section className="unit-era-lane" key={era}><div className="unit-lane-head"><small>{era}</small><b>{group.length} {group.length === 1 ? "milestone" : "milestones"}</b></div>{group.map((event) => <button className="unit-map-event" key={event.title} onClick={() => setActiveEvent(event)}><small>{event.label}</small><b>{event.title}</b><span>{event.effects}</span></button>)}</section>; })}{events.length === 0 && <div className="unit-empty">No matching milestones. Clear the filter or explore the key concepts below.</div>}</div> : <div className="unit-list-timeline">{events.map((event) => <button className="unit-list-event" key={`${event.year}-${event.title}`} onClick={() => setActiveEvent(event)}><span>{event.label}</span><div><b>{event.title}</b><p>{event.effects}</p></div><ArrowRight size={16}/></button>)}{events.length === 0 && <div className="unit-empty">No matching milestones.</div>}</div>}
    <section className="unit-blueprint"><div className="unit-blueprint-top"><div><div className="unit-kicker">REVIEW THE CATEGORY</div><h2>Key concepts</h2><p>Open a term to flip its recall card, review its AP tip, and update your mastery.</p></div><span>{unitTerms.length} TERMS · {unitTerms.filter((term) => masteredSet.has(term.id)).length} MASTERED</span></div><div className="unit-term-grid">{unitTerms.map((term) => <button key={term.id} onClick={() => { setActiveTerm(term); setFlashcard(false); }} className={`unit-term-card ${masteredSet.has(term.id) ? "is-mastered" : ""}`}><small>{masteredSet.has(term.id) ? "MASTERED · OPEN STUDY NOTE" : "OPEN STUDY NOTE"}</small><b>{term.term}</b><span>{term.def}</span></button>)}</div></section>
    {unitId === "french-rev" && <section className="unit-essay"><button className="unit-essay-toggle" onClick={() => setBlueprintOpen(!blueprintOpen)}><span><small>FRENCH REVOLUTION · LEQ STUDIO</small><b>Build an evidence-based argument</b></span>{blueprintOpen ? <ChevronDown/> : <ChevronRight/>}</button>{blueprintOpen && <div className="unit-essay-body"><p>Use a specific event as evidence, explain how it supports your claim, and connect it to a broader change or continuity.</p><div className="unit-essay-prompts"><article><b>Revolutionary goals</b><span>To what extent did the French Revolution achieve its political and social goals?</span></article><article><b>Napoleon and the Revolution</b><span>Evaluate the extent to which Napoleon preserved revolutionary change.</span></article><article><b>Vienna settlement</b><span>How successfully did the Congress of Vienna restore order after 1789?</span></article></div></div>}</section>}
    <nav className="unit-pagination"><Link to="/" className="unit-back"><ArrowLeft size={15}/> All categories</Link><Link to="/study-guide" className="unit-back">Open the complete guide <ArrowRight size={15}/></Link></nav>
    {(activeEvent || activeTerm) && <div className="unit-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setActiveEvent(null); setActiveTerm(null); } }}><section className="unit-modal term-modal study-drawer" role="dialog" aria-modal="true" aria-label={activeEvent?.title ?? activeTerm?.term ?? "Key concept"}><button className="unit-modal-close modal-close" onClick={() => { setActiveEvent(null); setActiveTerm(null); }} aria-label="Close"><X/></button>{activeEvent ? <><div className="unit-kicker">{activeEvent.label} · {unit.title}</div><h2>{activeEvent.title}</h2><h3>What happened</h3><p>{activeEvent.causes}</p><h3>Historical significance · “So what?”</h3><p>{activeEvent.effects}</p><div className="unit-deep-dive"><h3>Continuity vs. change over time</h3><p>{activeEvent.effects} Consider which institutions or social patterns persisted, and which changed as a result of this moment.</p><h3>SPICE themes</h3><div className="unit-connected-terms"><span>Political · {activeEvent.effects}</span><span>Social · {activeEvent.causes}</span><span>Economic · Place this event in the material conditions of {unit.era}.</span></div></div><h3>Connected study guide terms</h3><div className="unit-connected-terms">{activeEvent.terms.map((slug) => <span key={slug}>{TERMS.find((item) => item.id === slug)?.term ?? slug.replaceAll("-", " ")}</span>)}</div></> : activeTerm && <><span className="modal-kicker">{unit.title} · {unit.era}</span><div className="drawer-title-row"><h2>{activeTerm.term}</h2><span className="unit-badge">UNIT {CURRICULUM.findIndex((item) => item.id === unitId) + 1}</span></div><div className={`flashcard ${flashcard ? "flipped" : ""}`} onClick={() => setFlashcard(!flashcard)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setFlashcard(!flashcard); }}><small>{flashcard ? "BACK OF CARD · KEY FIGURES" : "QUICK RECALL · TAP TO FLIP"}</small><b>{flashcard ? activeTerm.figures : activeTerm.term}</b><span>{flashcard ? activeTerm.def : "Try to recall the meaning before flipping."}</span><i><RotateCcw size={13}/> FLIP CARD</i></div><div className="drawer-columns"><div className="modal-section"><small>CORE DEFINITION</small><p>{activeTerm.def}</p></div><div className="modal-section"><small>WHY IT MATTERS</small><p>{activeTerm.sig}</p></div></div><div className="exam-context"><small><Target size={13}/> AP EXAM TIP · COMMON TRAP</small><p>{activeTerm.ap}</p></div><div className="modal-section"><small>CONNECTED PEOPLE & IDEAS</small><div className="connected-terms">{relatedTerms.map((term) => <button key={term.id} onClick={() => { setActiveTerm(term); setFlashcard(false); }}>{term.term}<ArrowRight size={12}/></button>)}</div></div>{linkedEvents.length > 0 && <div className="modal-section"><small>LINKED HISTORICAL MOMENTS</small><div className="connected-terms">{linkedEvents.map((event) => <button key={`${event.year}-${event.title}`} onClick={() => { setActiveTerm(null); setActiveEvent(event); }}>{event.label} · {event.title}<ArrowRight size={12}/></button>)}</div></div>}<button className={`master-button ${masteredSet.has(activeTerm.id) ? "is-mastered" : ""}`} onClick={() => toggleTermMastery(activeTerm.id)}>{masteredSet.has(activeTerm.id) ? <Check size={17}/> : <Sparkles size={17}/>} {masteredSet.has(activeTerm.id) ? "Mastered — nice work" : "Mark as mastered"}</button></>}</section></div>}
  </main>;
}
