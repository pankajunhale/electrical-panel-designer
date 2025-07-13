"use client";

import { useState, useEffect } from "react";
import {
  Check,
  ChevronRight,
  Zap,
  Settings,
  Gauge,
  Grid3X3,
} from "lucide-react";
import { BasicInfoForm } from "@/components/forms/BasicInfoForm";
import { IncomerDetailsForm } from "@/components/forms/IncomerDetailsForm";
import { RatingDetailsForm } from "@/components/forms/RatingDetailsForm";
import { IncomerTypesForm } from "@/components/forms/IncomerTypesForm";
import { PanelDetailsForm } from "@/components/forms/PanelDetailsForm";
import { GridstackForm } from "@/components/forms/GridstackForm";
import type { BasicInfoFormData } from "@/schema/basic-info";
import { fetchEquipmentData } from "@/actions/equipment-data";
import {
  computeWizardData,
  type WizardFormData,
} from "@/actions/wizard-computation";

interface WizardData {
  basicInfo?: BasicInfoFormData;
  incomerDetails?: any;
  ratingDetails?: any;
  incomerTypes?: any;
  panelDetails?: any;
  gridLayout?: any;
  computedData?: WizardFormData;
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
  {
    id: 6,
    title: "Layout Designer",
    description: "Drag and drop panel layout",
    icon: Grid3X3,
  },
];

export function PanelDesignWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isComputingData, setIsComputingData] = useState(true);

  // Auto-compute all form data on component mount
  useEffect(() => {
    const computeAllFormData = async () => {
      try {
        setIsComputingData(true);
        console.log("🔄 Starting to compute form data...");

        // Fetch equipment data
        const equipmentData = await fetchEquipmentData();
        console.log("📊 Equipment data fetched:", equipmentData);

        // Compute all wizard data automatically
        const computedData = await computeWizardData(equipmentData);
        console.log("🧮 Computed wizard data:", computedData);

        // Set all computed form data with complete objects
        const wizardDataToSet = {
          basicInfo: {
            // System Details
            supplyLineVoltage:
              computedData.formData.basicInfo.supplyLineVoltage,
            supplySystem: computedData.formData.basicInfo.supplySystem,
            controlVoltage: computedData.formData.basicInfo.controlVoltage,
            panelType: computedData.formData.basicInfo.panelType,
            numberOfIncomers: computedData.formData.basicInfo.numberOfIncomers,
            numberOfOutgoingFeeders:
              computedData.formData.basicInfo.numberOfOutgoingFeeders,
            saveAsDefault: false,
            // Drawing Details
            title: "Electrical Panel Design",
            drawingNo: "EP-001",
            author: "System",
            company: "Electrical Panel Designer",
            customer: "Default Customer",
            colorFormat: "Colored" as const,
            ferrulPrefix: "A",
            // Make Details
            sfu: "Siemens_3KL",
            mccb: "Siemens_3WL",
            acb: "Siemens_3WL",
            mpcb: "Siemens_3RV",
            contactor: "Siemens_3RT",
            meter: "Conzerv",
            pilotDevice: "Teknik",
            capacitor: "EPCOS",
          },
          incomerDetails: computedData.formData.incomerDetails,
          ratingDetails: computedData.formData.ratingDetails,
          incomerTypes: computedData.formData.incomerTypes,
          panelDetails: computedData.formData.makeDetails,
          computedData: computedData.formData,
        };

        console.log("📝 Setting wizard data:", wizardDataToSet);
        setWizardData(wizardDataToSet);
      } catch (error) {
        console.error("❌ Error computing form data:", error);
      } finally {
        setIsComputingData(false);
        console.log("✅ Form data computation completed");
      }
    };

    computeAllFormData();
  }, []);

  const handleNext = async (stepData: any) => {
    console.log(
      `🔄 Step ${currentStep} - handleNext called with data:`,
      stepData
    );
    setIsLoading(true);
    try {
      switch (currentStep) {
        case 1:
          console.log("📝 Setting basicInfo data");
          setWizardData((prev) => ({ ...prev, basicInfo: stepData }));
          break;
        case 2:
          console.log("📝 Setting incomerDetails data");
          setWizardData((prev) => ({ ...prev, incomerDetails: stepData }));
          break;
        case 3:
          console.log("📝 Setting ratingDetails data");
          setWizardData((prev) => ({ ...prev, ratingDetails: stepData }));
          break;
        case 4:
          console.log("📝 Setting incomerTypes data");
          setWizardData((prev) => ({ ...prev, incomerTypes: stepData }));
          break;
        case 5:
          console.log("📝 Setting panelDetails data");
          setWizardData((prev) => ({ ...prev, panelDetails: stepData }));
          break;
        case 6:
          console.log("📝 Setting gridLayout data");
          setWizardData((prev) => ({ ...prev, gridLayout: stepData }));
          break;
      }
      if (currentStep < steps.length) {
        console.log(`➡️ Moving from step ${currentStep} to ${currentStep + 1}`);
        setCurrentStep(currentStep + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    console.log(
      `⬅️ Moving back from step ${currentStep} to ${currentStep - 1}`
    );
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

    // Show loading state while computing data
    if (isComputingData) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Computing form data from equipment...
            </p>
          </div>
        </div>
      );
    }

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
      case 6:
        return (
          <GridstackForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={wizardData.gridLayout}
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
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex flex-1 items-center ${
                  index < steps.length - 1 ? "mr-4" : ""
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-muted bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`ml-4 h-0.5 flex-1 ${
                      isCompleted ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="min-h-[600px]">{renderCurrentStep()}</div>
    </div>
  );
}
