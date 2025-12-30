import { UserProvider } from "@/store/userContext";
import FocusEditor from "@/components/FocusEditor";
import FloatingIndicator from "@/components/FloatingIndicator";
import ActionTrigger from "@/components/ActionTrigger";
import CopyButton from "@/components/CopyButton";
import PersonaSettings from "@/components/PersonaSettings";
import EmotionAmbient from "@/components/EmotionAmbient";
import RiskChecker from "@/components/RiskChecker";
import SmartPublisher from "@/components/SmartPublisher";
import ViralPredictor from "@/components/ViralPredictor";
import AntiScan from "@/components/AntiScan";
import DraftManager from "@/components/DraftManager";

export default function Home() {
  return (
    <UserProvider>
      <main className="min-h-screen bg-white selection:bg-gray-100">
        <EmotionAmbient />
        <SmartPublisher />
        <ViralPredictor />
        <DraftManager />
        <PersonaSettings />

        <div className="fixed inset-0 bottom-48 overflow-y-auto pt-32 pb-12 z-0">
          <FocusEditor />
        </div>

        <FloatingIndicator />
        <ActionTrigger />
        <CopyButton />

        <div className="fixed bottom-8 left-6 flex flex-col gap-4 z-[60]">
          <RiskChecker />
          <AntiScan />
        </div>
      </main>
    </UserProvider>
  );
}
