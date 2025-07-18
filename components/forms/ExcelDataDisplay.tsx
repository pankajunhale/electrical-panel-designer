"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, SummaryCard, DataGrid } from "@/components/ui/data-table";
import {
  ExcelDataProcessor,
  type ExcelEquipment,
} from "@/lib/excel-data-processor";
import {
  Zap,
  Settings,
  Gauge,
  Grid3X3,
  FileText,
  Database,
  BarChart3,
} from "lucide-react";

interface ExcelDataDisplayProps {
  equipment: ExcelEquipment[];
  onApplyToWizard: (formData: unknown) => void;
}

export function ExcelDataDisplay({
  equipment,
  onApplyToWizard,
}: ExcelDataDisplayProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const processor = new ExcelDataProcessor(equipment);
  const computedData = processor.computeAllFormData();
  const dataTables = processor.generateDataTables();

  const tabs = [
    { id: "summary", label: "Summary", icon: BarChart3 },
    { id: "basic-info", label: "Step 1: Basic Info", icon: Settings },
    { id: "incomer-details", label: "Step 2: Incomer Details", icon: Zap },
    { id: "rating-details", label: "Step 3: Rating Details", icon: Gauge },
    { id: "incomer-types", label: "Step 4: Incomer Types", icon: FileText },
    { id: "panel-details", label: "Step 5: Panel Details", icon: Grid3X3 },
    { id: "equipment", label: "Equipment Analysis", icon: Database },
  ];

  const renderSummary = () => (
    <div className="space-y-6">
      <DataGrid>
        <SummaryCard
          title="Total Equipment"
          value={computedData.equipmentSummary.totalEquipment}
          subtitle="Valid equipment with dimensions"
          color="blue"
          icon={<Database className="h-6 w-6" />}
        />
        <SummaryCard
          title="Total Power"
          value={`${computedData.equipmentSummary.totalPowerKW.toFixed(1)} kW`}
          subtitle={`${computedData.equipmentSummary.totalPowerHP.toFixed(
            1
          )} HP`}
          color="green"
          icon={<Zap className="h-6 w-6" />}
        />
        <SummaryCard
          title="Incomers Required"
          value={computedData.basicInfo.numberOfIncomers}
          subtitle="Based on starter types"
          color="yellow"
          icon={<Settings className="h-6 w-6" />}
        />
        <SummaryCard
          title="Feeders Required"
          value={computedData.basicInfo.numberOfOutgoingFeeders}
          subtitle="Equipment connections"
          color="purple"
          icon={<Gauge className="h-6 w-6" />}
        />
      </DataGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="Equipment by Type"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={dataTables.equipmentByType as Record<string, any>[]}
          columns={[
            { key: "EquipmentType", label: "Equipment Type" },
            { key: "Quantity", label: "Quantity", type: "number" },
          ]}
        />
        <DataTable
          title="Equipment by Starter Type"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={dataTables.equipmentByStarterType as Record<string, any>[]}
          columns={[
            { key: "StarterType", label: "Starter Type" },
            { key: "Quantity", label: "Quantity", type: "number" },
          ]}
        />
      </div>

      <DataTable
        title="Power Distribution"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={dataTables.equipmentSummary as Record<string, any>[]}
        columns={[
          { key: "Category", label: "Category" },
          { key: "Count", label: "Count", type: "number" },
          { key: "Value", label: "Value" },
        ]}
      />
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <DataTable
        title="Basic Information"
        data={[
          {
            Parameter: "Supply Line Voltage",
            Value: `${computedData.basicInfo.supplyLineVoltage}V`,
          },
          {
            Parameter: "Supply System",
            Value: computedData.basicInfo.supplySystem,
          },
          {
            Parameter: "Control Voltage",
            Value: `${computedData.basicInfo.controlVoltage}V`,
          },
          {
            Parameter: "Panel Type",
            Value: computedData.basicInfo.panelType,
          },
          {
            Parameter: "Number of Incomers",
            Value: computedData.basicInfo.numberOfIncomers,
          },
          {
            Parameter: "Number of Feeders",
            Value: computedData.basicInfo.numberOfOutgoingFeeders,
          },
        ]}
        columns={[
          { key: "Parameter", label: "Parameter" },
          { key: "Value", label: "Value" },
        ]}
      />

      <DataTable
        title="Drawing Details"
        data={[
          { Parameter: "Title", Value: computedData.basicInfo.title },
          { Parameter: "Drawing No.", Value: computedData.basicInfo.drawingNo },
          { Parameter: "Author", Value: computedData.basicInfo.author },
          { Parameter: "Company", Value: computedData.basicInfo.company },
          { Parameter: "Customer", Value: computedData.basicInfo.customer },
          {
            Parameter: "Color Format",
            Value: computedData.basicInfo.colorFormat,
          },
          {
            Parameter: "Ferrul Prefix",
            Value: computedData.basicInfo.ferrulPrefix,
          },
        ]}
        columns={[
          { key: "Parameter", label: "Parameter" },
          { key: "Value", label: "Value" },
        ]}
      />

      <DataTable
        title="Make Details"
        data={[
          { Component: "SFU", Make: computedData.basicInfo.sfu },
          { Component: "MCCB", Make: computedData.basicInfo.mccb },
          { Component: "ACB", Make: computedData.basicInfo.acb },
          { Component: "MPCB", Make: computedData.basicInfo.mpcb },
          { Component: "Contactor", Make: computedData.basicInfo.contactor },
          { Component: "Meter", Make: computedData.basicInfo.meter },
          {
            Component: "Pilot Device",
            Make: computedData.basicInfo.pilotDevice,
          },
          { Component: "Capacitor", Make: computedData.basicInfo.capacitor },
        ]}
        columns={[
          { key: "Component", label: "Component" },
          { key: "Make", label: "Make" },
        ]}
      />
    </div>
  );

  const renderIncomerDetails = () => (
    <div className="space-y-6">
      <DataTable
        title="Incomer Details"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={dataTables.incomers as Record<string, any>[]}
        columns={[
          { key: "Incomer", label: "Incomer" },
          { key: "AmpereRating", label: "Ampere Rating" },
          { key: "CurrentRating", label: "Current Rating" },
          { key: "WiringMaterial", label: "Wiring Material" },
          { key: "CableType", label: "Cable Type" },
        ]}
      />

      <DataTable
        title="Feeder Details"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={dataTables.feeders as Record<string, any>[]}
        columns={[
          { key: "Equipment", label: "Equipment" },
          { key: "StarterType", label: "Starter Type" },
          { key: "AmpereRating", label: "Ampere Rating" },
          { key: "ConnectTo", label: "Connect To" },
          { key: "CurrentRating", label: "Current Rating" },
          { key: "WiringMaterial", label: "Wiring Material" },
          { key: "CableType", label: "Cable Type" },
        ]}
      />
    </div>
  );

  const renderRatingDetails = () => (
    <div className="space-y-6">
      <DataTable
        title="Incomer Ratings"
        data={computedData.ratingDetails.incomers.map(
          (
            inc: (typeof computedData.ratingDetails.incomers)[number],
            index: number
          ) => ({
            Incomer:
              computedData.incomerDetails.incomers[index]?.name ||
              `Incomer ${index + 1}`,
            CurrentRating: inc.currentRating,
            WiringMaterial: inc.wiringMaterial,
            CableType: inc.cablesOrBusBars,
          })
        )}
        columns={[
          { key: "Incomer", label: "Incomer" },
          { key: "CurrentRating", label: "Current Rating" },
          { key: "WiringMaterial", label: "Wiring Material" },
          { key: "CableType", label: "Cable Type" },
        ]}
      />

      <DataTable
        title="Feeder Ratings"
        data={computedData.ratingDetails.feeders.map(
          (
            feed: (typeof computedData.ratingDetails.feeders)[number],
            index: number
          ) => ({
            Equipment:
              computedData.incomerDetails.feeders[index]?.name ||
              `Feeder ${index + 1}`,
            CurrentRating: feed.currentRating,
            WiringMaterial: feed.wiringMaterial,
            CableType: feed.cablesOrBusBars,
          })
        )}
        columns={[
          { key: "Equipment", label: "Equipment" },
          { key: "CurrentRating", label: "Current Rating" },
          { key: "WiringMaterial", label: "Wiring Material" },
          { key: "CableType", label: "Cable Type" },
        ]}
      />
    </div>
  );

  const renderIncomerTypes = () => (
    <div className="space-y-6">
      <DataTable
        title="Incomer Types"
        data={computedData.incomerTypes.incomers.map(
          (
            inc: (typeof computedData.incomerTypes.incomers)[number],
            idx: number
          ) => {
            const name =
              computedData.incomerDetails.incomers[idx]?.name ||
              `Incomer ${idx + 1}`;
            return {
              Incomer: name,
              Phase: inc.phase,
              KARating: `${inc.kARating}kA`,
              MetersRequired: inc.metersRequired,
              BusCouplerType: inc.busCouplerType,
              CableSpecs: inc.cableSpecs,
            };
          }
        )}
        columns={[
          { key: "Incomer", label: "Incomer" },
          { key: "Phase", label: "Phase" },
          { key: "KARating", label: "kA Rating" },
          { key: "MetersRequired", label: "Meters Required" },
          { key: "BusCouplerType", label: "Bus Coupler" },
          { key: "CableSpecs", label: "Cable Specs" },
        ]}
      />

      <DataTable
        title="Feeder Types"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={computedData.incomerTypes.feeders.map((feed: any) => {
          return {
            Equipment: "Feeder",
            Phase: feed.phase,
            KARating: `${feed.kARating}kA`,
            MetersRequired: feed.metersRequired,
            BusCouplerType: feed.busCouplerType,
            CableSpecs: feed.cableSpecs,
          };
        })}
        columns={[
          { key: "Equipment", label: "Equipment" },
          { key: "Phase", label: "Phase" },
          { key: "KARating", label: "kA Rating" },
          { key: "MetersRequired", label: "Meters Required" },
          { key: "BusCouplerType", label: "Bus Coupler" },
          { key: "CableSpecs", label: "Cable Specs" },
        ]}
      />
    </div>
  );

  const renderPanelDetails = () => (
    <div className="space-y-6">
      <DataTable
        title="Panel Specifications"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={dataTables.panelSpecifications as Record<string, any>[]}
        columns={[
          { key: "Parameter", label: "Parameter" },
          { key: "Value", label: "Value" },
        ]}
      />

      <DataTable
        title="Panel Construction Details"
        data={[
          {
            Parameter: "Max Height",
            Value: `${computedData.panelDetails.maxHeight}mm`,
          },
          {
            Parameter: "Panel Thickness",
            Value: `${computedData.panelDetails.panelThickness}mm`,
          },
          {
            Parameter: "Partition Requirements",
            Value: computedData.panelDetails.partitionRequirements,
          },
          {
            Parameter: "Cable Entry",
            Value: computedData.panelDetails.cableEntry,
          },
          {
            Parameter: "Ventilation",
            Value: computedData.panelDetails.ventilation,
          },
          {
            Parameter: "Mounting Type",
            Value: computedData.panelDetails.mountingType,
          },
          {
            Parameter: "Protection Level",
            Value: computedData.panelDetails.protectionLevel,
          },
        ]}
        columns={[
          { key: "Parameter", label: "Parameter" },
          { key: "Value", label: "Value" },
        ]}
      />
    </div>
  );

  const renderEquipmentAnalysis = () => (
    <div className="space-y-6">
      <DataTable
        title="Equipment List"
        data={equipment.map((eq) => ({
          ID: eq.id,
          Description: eq.description,
          Rating: `${eq.rating} kW`,
          HP: `${eq.hp} HP`,
          StarterType: eq.starterType,
          Quantity: eq.qty,
          Dimensions: eq.height > 0 ? `${eq.width}×${eq.height}mm` : "N/A",
          Status: eq.height > 0 ? "Valid" : "No Dimensions",
        }))}
        columns={[
          { key: "ID", label: "ID", type: "number" },
          { key: "Description", label: "Description" },
          { key: "Rating", label: "Rating" },
          { key: "HP", label: "HP" },
          { key: "StarterType", label: "Starter Type" },
          { key: "Quantity", label: "Qty", type: "number" },
          { key: "Dimensions", label: "Dimensions" },
          { key: "Status", label: "Status", type: "badge" },
        ]}
      />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "summary":
        return renderSummary();
      case "basic-info":
        return renderBasicInfo();
      case "incomer-details":
        return renderIncomerDetails();
      case "rating-details":
        return renderRatingDetails();
      case "incomer-types":
        return renderIncomerTypes();
      case "panel-details":
        return renderPanelDetails();
      case "equipment":
        return renderEquipmentAnalysis();
      default:
        return renderSummary();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Excel Data Analysis</h2>
        <Button onClick={() => onApplyToWizard(computedData)}>
          Apply to Wizard
        </Button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="min-h-[600px]">{renderContent()}</div>
    </div>
  );
}
