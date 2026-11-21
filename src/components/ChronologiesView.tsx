import { useState } from "react";
import { Clock3 } from "lucide-react";
import data from "../data/chronologies.json";

type Event = { date: string; event: string };
type Chapter = { chapter: number; title: string; events: Event[] };
const chapters = (data as { chapters: Chapter[] }).chapters;

export default function ChronologiesView() {
  const [chapterNumber, setChapterNumber] = useState(chapters[0]?.chapter ?? 12);
  const chapter = chapters.find((item) => item.chapter === chapterNumber) ?? chapters[0];

  if (!chapter) return <p>No chronology chapters are available.</p>;
  return <section className="study-suite">
    <header className="page-title"><div className="eyebrow">TEXTBOOK CHRONOLOGIES</div><h1>History, chapter by chapter.</h1><p>Choose a chapter to follow its events in order.</p></header>
    <label className="suite-filter">CHAPTER<select value={chapter.chapter} onChange={(e) => setChapterNumber(Number(e.target.value))}>{chapters.map((item) => <option key={item.chapter} value={item.chapter}>Chapter {item.chapter} · {item.title}</option>)}</select></label>
    <div className="timeline-shell"><div className="timeline-heading"><span>CHAPTER {chapter.chapter}</span><span>{chapter.events.length} events</span></div><div className="textbook-chronology">{chapter.events.map((event, index) => <article className="textbook-event" key={`${event.date}-${index}`}><span className="textbook-event-date"><Clock3 size={15}/>{event.date}</span><div><b>{event.event}</b></div></article>)}</div></div>
  </section>;
}
