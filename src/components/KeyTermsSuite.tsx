import { useMemo, useState } from "react";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import data from "../data/key_terms.json";

type Term = { term: string; definition: string; page: string };
type ChapterTerms = { title: string; terms: Term[] };
const chapters = Object.entries((data as { ap_euro_key_terms: Record<string, ChapterTerms> }).ap_euro_key_terms);
type Mode = "flashcards" | "test";
type TestType = "mcq" | "typed";

export default function KeyTermsSuite() {
  const [chapter, setChapter] = useState("all");
  const [mode, setMode] = useState<Mode>("flashcards");
  const [testType, setTestType] = useState<TestType>("mcq");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const terms = useMemo(() => chapters.flatMap(([id, group]) => chapter === "all" || id === chapter ? group.terms.map((term) => ({ ...term, chapterTitle: group.title, chapterId: id })) : []), [chapter]);
  const current = terms[index];
  const reset = (nextChapter = chapter, nextMode = mode) => { setChapter(nextChapter); setMode(nextMode); setIndex(0); setFlipped(false); setAnswer(""); setResult(null); setScore(0); setDone(false); };
  const choices = useMemo(() => { if (!current) return []; const others = terms.filter((term) => term.term !== current.term).slice(0, 3); return [...others, current].sort((a, b) => a.term.localeCompare(b.term)); }, [current, terms]);
  function grade(value: string) { if (!current || result !== null) return; const correct = value.trim().toLowerCase() === current.term.trim().toLowerCase(); setAnswer(value); setResult(correct); if (correct) setScore((n) => n + 1); }
  function advance() { if (index + 1 >= terms.length) { setDone(true); return; } setIndex((n) => n + 1); setFlipped(false); setAnswer(""); setResult(null); }
  return <section className="study-suite"><header className="page-title"><div className="eyebrow">KEY TERMS STUDY SUITE</div><h1>Know the language of history.</h1><p>Study one chapter or mix terms from every chapter.</p></header>
    <div className="suite-controls"><label>CHAPTERS<select value={chapter} onChange={(e) => reset(e.target.value)}><option value="all">All Chapters Mixed</option>{chapters.map(([id, group]) => <option key={id} value={id}>{id.replace("chapter_", "Chapter ")} · {group.title}</option>)}</select></label><div className="suite-tabs"><button className={mode === "flashcards" ? "selected" : ""} onClick={() => reset(chapter, "flashcards")}>Flashcards</button><button className={mode === "test" ? "selected" : ""} onClick={() => reset(chapter, "test")}>Assessment / Test</button></div></div>
    {!current ? <p>No terms found.</p> : done ? <div className="term-study-card"><div className="eyebrow">ROUND COMPLETE</div><h2>{score} / {terms.length} correct</h2><button className="button-primary" onClick={() => reset()}><RotateCcw size={15}/> Try again</button></div> : mode === "flashcards" ? <div className={`term-study-card flashcard-study ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((value) => !value)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFlipped((value) => !value); }}><span className="eyebrow">{current.chapterId.replace("chapter_", "CHAPTER ")} · CARD {index + 1} / {terms.length}</span><h2>{flipped ? current.definition : current.term}</h2><p>{flipped ? `Textbook page ${current.page}` : "Think of the definition, then tap to flip."}</p><small>CLICK TO FLIP</small><button className="button-primary" onClick={(e) => { e.stopPropagation(); advance(); }}>Next card <ArrowRight size={15}/></button></div> : <div className="term-study-card"><span className="eyebrow">{testType === "mcq" ? "MULTIPLE CHOICE" : "TYPED RECALL"} · {index + 1} / {terms.length} · SCORE {score}</span><h2>{testType === "mcq" ? current.definition : `Define: ${current.term}`}</h2><div className="suite-tabs"><button className={testType === "mcq" ? "selected" : ""} onClick={() => { setTestType("mcq"); setResult(null); }}>Multiple choice</button><button className={testType === "typed" ? "selected" : ""} onClick={() => { setTestType("typed"); setResult(null); }}>Typed test</button></div>{testType === "mcq" ? <div className="term-options">{choices.map((option) => <button key={option.term} disabled={result !== null} onClick={() => grade(option.term)}>{option.term}</button>)}</div> : <form onSubmit={(e) => { e.preventDefault(); grade(answer); }}><input value={answer} disabled={result !== null} onChange={(e) => setAnswer(e.target.value)} placeholder="Type the matching term"/><button className="button-primary" disabled={result !== null}>Check answer</button></form>}{result !== null && <div className={result ? "feedback feedback-good" : "feedback feedback-review"}><b>{result ? <><Check size={14}/> Correct</> : <><X size={14}/> Not quite · {current.term}</>}</b><p>{current.definition}</p><button className="button-primary" onClick={advance}>Continue <ArrowRight size={15}/></button></div>}</div>}
  </section>;
}
