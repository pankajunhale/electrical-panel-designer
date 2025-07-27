"use client";
import React, { useState } from "react";
import { ProjectCreationForm } from "./ProjectCreationForm";
import { PanelsTable } from "./PanelsTable";
import { PanelDesignWorkspace } from "./PanelDesignWorkspace";

const mockPanels = [
  { id: "panel-001", name: "Main Control Panel", location: "Control Room" },
  { id: "panel-002", name: "Dosing Pump Panel", location: "Chemical Room" },
];

export function PanelBuilderApp() {
  const [step, setStep] = useState<"project" | "panels" | "design">("project");
  const [, setProject] = useState<unknown>(null);
  const [, setSelectedPanel] = useState<unknown>(null);

  if (step === "project") {
    return (
      <ProjectCreationForm
        onNext={(data) => {
          setProject(data);
          setStep("panels");
        }}
      />
    );
  }

  if (step === "panels") {
    return (
      <PanelsTable
        panels={mockPanels}
        onSelect={(panel) => {
          setSelectedPanel(panel);
          setStep("design");
        }}
      />
    );
  }

  if (step === "design") {
    return <PanelDesignWorkspace />;
  }

  return null;
}
