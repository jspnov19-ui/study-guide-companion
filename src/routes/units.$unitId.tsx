import { createFileRoute, notFound } from "@tanstack/react-router";
import UnitStudyPage from "../components/UnitStudyPage";
import { CURRICULUM } from "../data/curriculum";
import type { UnitId } from "../data/types";

export const Route = createFileRoute("/units/$unitId")({
  component: UnitRoute,
  head: ({ params }) => {
    const unit = CURRICULUM.find((item) => item.id === params.unitId);
    return { meta: [{ title: unit ? `${unit.title} | EuroWise` : "Study category | EuroWise" }, { name: "description", content: unit?.summary ?? "AP European History category study page." }] };
  },
});

function UnitRoute() {
  const { unitId } = Route.useParams();
  if (!CURRICULUM.some((unit) => unit.id === unitId)) throw notFound();
  return <UnitStudyPage unitId={unitId as UnitId} />;
}
