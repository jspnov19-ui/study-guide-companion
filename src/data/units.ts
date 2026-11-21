import type { Unit } from "./types";
export const UNITS: Unit[] = [
  { id: "renaissance", title: "The Renaissance", era: "c. 1350–1550", blurb: "Italian city-states, humanism, and a new confidence in the individual." },
  { id: "reformation", title: "Reformation & Counter-Reformation", era: "1517–1648", blurb: "Luther shatters Latin Christendom; Rome answers at Trent." },
  { id: "exploration", title: "Age of Exploration", era: "1415–1700", blurb: "Caravels, conquest, and the first truly global economy." },
  { id: "religious-wars", title: "The Religious Wars", era: "1555–1648", blurb: "Confession and dynasty collide from Paris to Prague." },
  { id: "absolutism", title: "Absolutism & Constitutionalism", era: "1600–1725", blurb: "Versailles versus Westminster: two answers to sovereignty." },
  { id: "scientific", title: "The Scientific Revolution", era: "1543–1687", blurb: "From Copernicus to Newton, nature becomes mathematical." },
  { id: "enlightenment", title: "The Enlightenment", era: "1687–1789", blurb: "Reason applied to society, government, and faith." },
  { id: "economic", title: "Agricultural & Economic Revolution", era: "1650–1800", blurb: "Enclosure, cottage industry, and shifting family life." },
  { id: "french-rev", title: "French Revolution & Napoleon", era: "1756–1815", blurb: "From Estates General to Waterloo and the Vienna settlement." },
  { id: "industrial", title: "The Industrial Revolution", era: "1760–1850", blurb: "Machines, steam, factories — and the reforms they forced." },
];
export const unitById = Object.fromEntries(UNITS.map((u) => [u.id, u])) as Record<Unit["id"], Unit>;
