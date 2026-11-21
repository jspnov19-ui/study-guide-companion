export type UnitId =
  | "renaissance" | "reformation" | "exploration" | "religious-wars" | "absolutism"
  | "scientific" | "enlightenment" | "economic" | "french-rev" | "industrial";

export interface Unit { id: UnitId; title: string; era: string; blurb: string }

export interface Term {
  id: string;
  term: string;
  unit: UnitId;
  def: string;
  sig: string;
  figures: string;
  ap: string;
}

export const t = (unit: UnitId) => (term: string, def: string, sig: string, figures: string, ap: string): Term => ({
  id: term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  term, unit, def, sig, figures, ap,
});
