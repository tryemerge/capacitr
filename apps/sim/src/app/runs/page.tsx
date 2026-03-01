import type { Metadata } from "next";
import SimulationRuns from "@/components/SimulationRuns";

export const metadata: Metadata = {
  title: "Simulation Runs — Configure, Watch & Analyze",
};

export default function RunsPage() {
  return <SimulationRuns />;
}
