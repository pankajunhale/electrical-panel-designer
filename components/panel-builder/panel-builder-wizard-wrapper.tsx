"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProjectsForm } from "@/components/forms/ga/ProjectsForm";
import { ClientsForm } from "@/components/forms/ga/ClientsForm";
import { PanelsForm } from "@/components/forms/ga/PanelsForm";
import { EquipmentDataForm } from "@/components/forms/ga/EquipmentDataForm";
import { PanelDesignWizard } from "@/components/panel-design/PanelDesignWizard";

const steps = [
  { label: "Project", description: "Create or select a project" },
  { label: "Client", description: "Enter client details" },
  { label: "Equipment", description: "Input equipment data" },
  { label: "Panels", description: "Define electrical panels" },
  { label: "Design", description: "Panel design wizard" },
];

export default function PanelBuilderWizardWrapper() {
  const [step, setStep] = useState(0);

  // Optionally, you can manage form data for each step here

  const renderStep = () => {
    switch (step) {
      case 0:
        return <ProjectsForm onNext={() => setStep(step + 1)} />;
      case 1:
        return <ClientsForm onNext={() => setStep(step + 1)} />;
      case 2:
        return <EquipmentDataForm onNext={() => setStep(step + 1)} />;
      case 3:
        return <PanelsForm onNext={() => setStep(step + 1)} />;
      case 4:
        return <PanelDesignWizard />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.label} className="flex-1 flex flex-col items-center">
            <div
              className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${
                i === step
                  ? "bg-blue-600"
                  : i < step
                  ? "bg-green-500"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`mt-2 text-xs ${
                i === step ? "text-blue-700 font-semibold" : "text-gray-500"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Animated Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow p-6 min-h-[400px]"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          className="btn"
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0}
        >
          Back
        </button>
        <button
          className="btn"
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          disabled={step === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
