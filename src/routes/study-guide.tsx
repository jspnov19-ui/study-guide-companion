import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { CURRICULUM } from "../data/curriculum";

export const Route = createFileRoute("/study-guide")({
  component: StudyGuide,
  head: () => ({ meta: [{ title: "Fall Semester Study Guide | EuroWise" }, { name: "description", content: "The original AP European History semester study guide and its ten core categories." }] }),
});

function StudyGuide() {
  return <main className="guide-page"><header className="guide-mast"><Link to="/" className="guide-home"><ArrowLeft size={16}/> EuroWise home</Link><span>AP EUROPEAN HISTORY · FALL SEMESTER</span></header><section className="guide-hero"><div className="unit-kicker">REFERENCE LIBRARY</div><h1>Fall semester<br/><em>study guide.</em></h1><p>The original class handout is preserved below. Use the category index to jump into a focused unit page with milestones and interactive review.</p></section><div className="guide-layout"><aside className="guide-index"><div className="unit-kicker">CORE CATEGORIES</div>{CURRICULUM.map((unit, index) => <a key={unit.id} href={`#guide-${unit.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{unit.title}</a>)}</aside><article className="guide-content"><section className="guide-source"><div><BookOpen size={18}/><div><b>Original study guide handout</b><span>Text-selectable PDF · Fall semester</span></div></div><a href="/fall-semester-study-guide.pdf" target="_blank" rel="noreferrer">Open PDF <ExternalLink size={14}/></a></section><iframe className="guide-pdf" src="/fall-semester-study-guide.pdf" title="Original Fall Semester AP European History Study Guide" />{CURRICULUM.map((unit, index) => <section className="guide-category" id={`guide-${unit.id}`} key={unit.id}><div className="unit-kicker">CORE CATEGORY {String(index + 1).padStart(2, "0")} · {unit.era}</div><h2>{unit.title}</h2><p>{unit.summary}</p><ul>{unit.terms.map((term) => <li key={term}>{term}</li>)}</ul><Link to="/units/$unitId" params={{ unitId: unit.id }} className="guide-category-link">Study this category <span>→</span></Link></section>)}</article></div></main>;
}
