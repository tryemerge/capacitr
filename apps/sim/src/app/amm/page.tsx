import AMMSandbox from "@/components/AMMSandbox";

export const metadata = {
  title: "Capacitor AMM Sandbox — Two-AMM Interactive Simulation",
  description: "Explore two constant-product AMMs (USDC/Cathode + Cathode/Anode) with real-time USDC pricing for governance actions.",
};

export default function AMMPage() {
  return <AMMSandbox />;
}
