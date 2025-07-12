"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SystemDetailsForm } from "./SystemDetailsForm";
import { useState } from "react";

const steps = [
  { label: "System Details" },
  { label: "Drawing Details" },
  { label: "Make Details" },
  { label: "Incomer Details" },
  { label: "Feeder Details" },
  { label: "Rating Details" },
  { label: "Incomer/Feeder Types" },
];

export function Wizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async (stepData: any) => {
    setWizardData((prev: any) => ({ ...prev, ...stepData }));
    setCurrentStep((prev: number) => Math.min(prev + 1, steps.length));
  };

  const handlePrev = () => {
    setCurrentStep((prev: number) => Math.max(prev - 1, 1));
  };

  const handleSystemDetailsSubmit = async (data: any) => {
    setWizardData((prev: any) => ({ ...prev, systemDetails: data }));
    setCurrentStep((prev: number) => Math.min(prev + 1, steps.length));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.label} className="flex-1 flex flex-col items-center">
            <div
              className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${
                i + 1 === currentStep
                  ? "bg-blue-600"
                  : i + 1 < currentStep
                  ? "bg-green-500"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`mt-2 text-xs ${
                i + 1 === currentStep
                  ? "text-blue-700 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6 min-h-[300px]">
        {currentStep === 1 && (
          <SystemDetailsForm onSubmit={handleSystemDetailsSubmit} />
        )}
        {currentStep === 2 && <div>Drawing Details Form goes here</div>}
        {currentStep === 3 && <div>Make Details Form goes here</div>}
        {currentStep === 4 && <div>Incomer Details Form goes here</div>}
        {currentStep === 5 && <div>Feeder Details Form goes here</div>}
        {currentStep === 6 && <div>Rating Details Form goes here</div>}
        {currentStep === 7 && <div>Incomer/Feeder Types Form goes here</div>}
      </div>
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        <Button
          onClick={() => handleNext({})}
          disabled={currentStep === steps.length + 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
