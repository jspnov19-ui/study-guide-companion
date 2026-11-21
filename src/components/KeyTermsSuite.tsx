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
  const [missed, setMissed] = useState<Term[]>([]);
  const terms = useMemo(() => chapters.flatMap(([id, group]) => chapter === "all" || id === chapter ? group.terms.map((term) => ({ ...term, chapterTitle: group.title, chapterId: id })) : []), [chapter]);
  const current = terms[index];
  const reset = (nextChapter = chapter, nextMode = mode) => { setChapter(nextChapter); setMode(nextMode); setIndex(0); setFlipped(false); setAnswer(""); setResult(null); setScore(0); setDone(false); setMissed([]); };
  const choices = useMemo(() => { if (!current) return []; const others = terms.filter((term) => term.term !== current.term).slice(0, 3); return [...others, current].sort((a, b) => a.term.localeCompare(b.term)); }, [current, terms]);
  function grade(value: string) { if (!current || result !== null) return; const correct = isCloseMatch(value, current.term); setAnswer(value); setResult(correct); if (correct) setScore((n) => n + 1); else setMissed((list) => [...list, current]); }
  function advance() { if (index + 1 >= terms.length) { setDone(true); return; } setIndex((n) => n + 1); setFlipped(false); setAnswer(""); setResult(null); }
  return <section className="study-suite"><header className="page-title"><div className="eyebrow">KEY TERMS STUDY SUITE</div><h1>Know the language of history.</h1><p>Study one chapter or mix terms from every chapter.</p></header>
    <div className="suite-controls"><label>CHAPTERS<select value={chapter} onChange={(e) => reset(e.target.value)}><option value="all">All Chapters Mixed</option>{chapters.map(([id, group]) => <option key={id} value={id}>{id.replace("chapter_", "Chapter ")} · {group.title}</option>)}</select></label><div className="suite-tabs"><button className={mode === "flashcards" ? "selected" : ""} onClick={() => reset(chapter, "flashcards")}>Flashcards</button><button className={mode === "test" ? "selected" : ""} onClick={() => reset(chapter, "test")}>Assessment / Test</button></div></div>
    {!current ? <p>No terms found.</p> : done ? <div className="term-results"><div className="term-score-ring" style={{"--term-score":`${Math.round(score/terms.length*100)}%`} as React.CSSProperties}><div><b>{Math.round(score/terms.length*100)}%</b><span>ACCURACY</span></div></div><div className="term-results-copy"><span className="eyebrow">ROUND COMPLETE · {chapter === "all" ? "ALL CHAPTERS MIXED" : chapter.replace("chapter_", "CHAPTER ")}</span><h2>{score === terms.length ? "Flawless recall." : score / terms.length >= .75 ? "Strong command." : score / terms.length >= .5 ? "Good progress." : "Keep building."}</h2><p>You got <b>{score} of {terms.length}</b> correct and missed <b>{missed.length}</b>. {missed.length ? "Review the terms below, then take another round." : "You recalled every term in this round."}</p><div className="term-result-actions"><button className="button-primary" onClick={() => reset()}><RotateCcw size={15}/> Try this set again</button><button className="suite-secondary" onClick={() => reset("all", "flashcards")}>Review flashcards</button></div></div>{missed.length>0&&<div className="term-missed-list"><h3>Terms to revisit</h3>{missed.map((term,i)=><article key={`${term.term}-${i}`}><b>{term.term}</b><p>{term.definition}</p><small>PAGE {term.page}</small></article>)}</div>}</div> : mode === "flashcards" ? <><div className="flashcard-progress"><span>{chapter === "all" ? "MIXED CHAPTERS" : current.chapterId.replace("chapter_", "CHAPTER ")}</span><b>{index+1}<i> / {terms.length}</i></b><div><i style={{width:`${(index+1)/terms.length*100}%`}}/></div></div><div className={`term-study-card flashcard-study ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((value) => !value)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFlipped((value) => !value); }}><span className="eyebrow">{flipped ? "DEFINITION" : "KEY TERM"} · TEXTBOOK PAGE {current.page}</span><h2>{flipped ? current.definition : current.term}</h2><p>{flipped ? current.term : "Think of the meaning, then flip to check your recall."}</p><small>CLICK CARD TO FLIP</small><div className="flashcard-actions"><button className="suite-secondary" onClick={(e) => { e.stopPropagation(); setFlipped((value) => !value); }}>Flip card</button><button className="button-primary" onClick={(e) => { e.stopPropagation(); advance(); }}>Next card <ArrowRight size={15}/></button></div></div></> : <div className="term-study-card"><span className="eyebrow">{testType === "mcq" ? "MULTIPLE CHOICE" : "TYPE THE TERM"} · {index + 1} / {terms.length} · SCORE {score}</span><h2>{current.definition}</h2><p>{testType === "typed" ? "Read the definition and type the matching key term." : "Choose the term that matches this definition."}</p><div className="suite-tabs"><button className={testType === "mcq" ? "selected" : ""} onClick={() => { setTestType("mcq"); setResult(null); }}>Multiple choice</button><button className={testType === "typed" ? "selected" : ""} onClick={() => { setTestType("typed"); setResult(null); }}>Typed test</button></div>{testType === "mcq" ? <div className="term-options">{choices.map((option) => <button key={option.term} disabled={result !== null} onClick={() => grade(option.term)}>{option.term}</button>)}</div> : <form onSubmit={(e) => { e.preventDefault(); grade(answer); }}><input value={answer} disabled={result !== null} onChange={(e) => setAnswer(e.target.value)} placeholder="Type the matching term"/><button className="button-primary" disabled={result !== null}>Check answer</button></form>}{result !== null && <div className={result ? "feedback feedback-good" : "feedback feedback-review"}><b>{result ? <><Check size={14}/> {normalizeTerm(answer) === normalizeTerm(current.term) ? "Correct" : "Correct · close spelling accepted"}</> : <><X size={14}/> Not quite · {current.term}</>}</b><p>{current.definition}</p><button className="button-primary" onClick={advance}>Continue <ArrowRight size={15}/></button></div>}</div>}
  </section>;
}

function normalizeTerm(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function editDistance(left: string, right: string) {
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row++) {
    const next = [row];
    for (let column = 1; column <= right.length; column++) {
      next[column] = Math.min(next[column - 1]! + 1, previous[column]! + 1, previous[column - 1]! + (left[row - 1] === right[column - 1] ? 0 : 1));
    }
    previous = next;
  }
  return previous[right.length]!;
}

function isCloseMatch(answer: string, expected: string) {
  const left = normalizeTerm(answer);
  const right = normalizeTerm(expected);
  if (!left || !right) return false;
  if (left === right) return true;
  const maxLength = Math.max(left.length, right.length);
  const allowedTypos = Math.max(1, Math.min(3, Math.floor(maxLength * 0.12)));
  return Math.abs(left.length - right.length) <= allowedTypos && editDistance(left, right) <= allowedTypos;
}
