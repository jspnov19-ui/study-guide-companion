import { createFileRoute, notFound } from "@tanstack/react-router";
import UnitStudyPage from "../components/UnitStudyPage";
import { CURRICULUM } from "../data/curriculum";
import type { UnitId } from "../data/types";

export const Route = createFileRoute("/units/$unitId")({
  component: UnitRoute,
  head: ({ params }) => {
    const unit = CURRICULUM.find((item) => item.id === params.unitId);
    const title = unit ? `${unit.title} | EuroWise AP Euro` : "Study category | EuroWise";
    const description = unit ? `${unit.summary} Explore milestones and tracked vocabulary for AP European History.` : "Explore an AP European History category with EuroWise.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { name: "twitter:title", content: title }, { name: "twitter:description", content: description }] };
  },
});

function UnitRoute() {
  const { unitId } = Route.useParams();
  if (!CURRICULUM.some((unit) => unit.id === unitId)) throw notFound();
  return <UnitStudyPage unitId={unitId as UnitId} />;
}
