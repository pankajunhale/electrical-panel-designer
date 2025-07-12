"use client";

import { useState } from "react";
import { Check, ChevronRight, Zap, Settings, Gauge } from "lucide-react";
import { BasicInfoForm } from "@/components/forms/BasicInfoForm";
import { IncomerDetailsForm } from "@/components/forms/IncomerDetailsForm";
import { RatingDetailsForm } from "@/components/forms/RatingDetailsForm";
import { IncomerTypesForm } from "@/components/forms/IncomerTypesForm";
import { PanelDetailsForm } from "@/components/forms/PanelDetailsForm";
import type { BasicInfoFormData } from "@/schema/basic-info";

interface WizardData {
  basicInfo?: BasicInfoFormData;
  incomerDetails?: any;
  ratingDetails?: any;
  incomerTypes?: any;
  panelDetails?: any;
}

const steps = [
  {
    id: 1,
    title: "Basic Info",
    description: "System, Drawing, and Make Details",
    icon: Settings,
  },
  {
    id: 2,
    title: "Incomer Details",
    description: "Incomer specifications",
    icon: Zap,
  },
  {
    id: 3,
    title: "Rating Details",
    description: "Incomer and Feeder Ratings",
    icon: Gauge,
  },
  {
    id: 4,
    title: "Incomer Types",
    description: "Incomer type details",
    icon: Zap,
  },
  {
    id: 5,
    title: "Panel Details",
    description: "Panel construction and details",
    icon: Settings,
  },
];

export function PanelDesignWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async (stepData: any) => {
    setIsLoading(true);
    try {
      switch (currentStep) {
        case 1:
          setWizardData((prev) => ({ ...prev, basicInfo: stepData }));
          break;
        case 2:
          setWizardData((prev) => ({ ...prev, incomerDetails: stepData }));
          break;
        case 3:
          setWizardData((prev) => ({ ...prev, ratingDetails: stepData }));
          break;
        case 4:
          setWizardData((prev) => ({ ...prev, incomerTypes: stepData }));
          break;
        case 5:
          setWizardData((prev) => ({ ...prev, panelDetails: stepData }));
          break;
      }
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    const numberOfIncomers = parseInt(
      wizardData.basicInfo?.numberOfIncomers || "1",
      10
    );
    const numberOfFeeders = parseInt(
      wizardData.basicInfo?.numberOfOutgoingFeeders || "1",
      10
    );
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={wizardData.basicInfo}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <IncomerDetailsForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={wizardData.incomerDetails}
            isLoading={isLoading}
            numberOfIncomers={numberOfIncomers}
            numberOfFeeders={numberOfFeeders}
          />
        );
      case 3:
        return (
          <RatingDetailsForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={wizardData.ratingDetails}
            isLoading={isLoading}
            numberOfIncomers={numberOfIncomers}
            numberOfFeeders={numberOfFeeders}
          />
        );
      case 4:
        return (
          <IncomerTypesForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={wizardData.incomerTypes}
            isLoading={isLoading}
            numberOfIncomers={numberOfIncomers}
            numberOfFeeders={numberOfFeeders}
          />
        );
      case 5:
        return (
          <PanelDetailsForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={wizardData.panelDetails}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Stepper with Icon */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Panel Design
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
        </div>
      </div>
      {/* Stepper */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.id} className="flex items-center min-w-0">
                <div className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                  </div>
                  <div className="ml-2 min-w-0">
                    <p className="text-xs font-medium truncate max-w-[90px]">
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-3 h-3 mx-1 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Current Step Content */}
      <div className="bg-background border rounded-lg p-4 sm:p-5 md:p-6">
        {renderCurrentStep()}
      </div>
    </div>
  );
}
