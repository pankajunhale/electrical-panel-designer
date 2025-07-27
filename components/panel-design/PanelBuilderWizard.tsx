"use client";
import { useState } from "react";
import { ProjectsForm } from "@/components/forms/ga/ProjectsForm";
import { EquipmentDataForm } from "@/components/forms/ga/EquipmentDataForm";
import { PanelsTable } from "./PanelsTable";
import { PanelDesignWorkspace } from "./PanelDesignWorkspace";
import { Button } from "@/components/ui/button";

const steps = [
  { label: "Projects..." },
  { label: "Equipment" },
  { label: "Panels" },
  { label: "Design" },
];

const mockPanels = [
  { id: "panel-001", name: "Main Control Panel", location: "Control Room" },
  { id: "panel-002", name: "Dosing Pump Panel", location: "Chemical Room" },
];

export function PanelBuilderWizard() {
  const [step, setStep] = useState(1);
  const [, setProjectData] = useState<unknown>(null);
  const [, setEquipmentData] = useState<unknown>(null);
  const [, setSelectedPanel] = useState<unknown>(null);

  return (
    <div className="w-full max-w-5xl mx-auto p-8">
      {/* Stepper UI */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.label} className="flex-1 flex flex-col items-center">
            <div
              className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${
                i + 1 === step
                  ? "bg-blue-600"
                  : i + 1 < step
                  ? "bg-green-500"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`mt-2 text-xs ${
                i + 1 === step ? "text-blue-700 font-semibold" : "text-gray-500"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6 min-h-[300px]">
        {step === 1 && (
          <ProjectsForm
            onNext={(data) => {
              setProjectData(data);
              setStep(2);
            }}
            isLoading={false}
          />
        )}
        {step === 2 && (
          <EquipmentDataForm
            onNext={(data) => {
              setEquipmentData(data);
              setStep(3);
            }}
            onBack={() => setStep(1)}
            isLoading={false}
          />
        )}
        {step === 3 && (
          <PanelsTable
            panels={mockPanels}
            onSelect={(panel) => {
              setSelectedPanel(panel);
              setStep(4);
            }}
          />
        )}
        {step === 4 && <PanelDesignWorkspace />}
      </div>
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setStep(step + 1)}
          disabled={step === steps.length}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
