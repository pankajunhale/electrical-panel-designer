"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  importPanelEquipmentData,
  validateTabularData,
  type ImportActionResult,
} from "@/actions/panel-data-import";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Zap,
  Settings,
  Gauge,
  Power,
  Shield,
  Cpu,
  Battery,
  RotateCcw,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface PanelDataImportFormProps {
  projects: Project[];
}

// Function to get icon for equipment type
function getEquipmentTypeIcon(type: string) {
  const upperType = type.toUpperCase();

  if (
    upperType.includes("CIRCUIT BREAKER") ||
    upperType.includes("ACB") ||
    upperType.includes("MCCB")
  ) {
    return <Shield className="w-4 h-4" />;
  }
  if (upperType.includes("TRANSFORMER")) {
    return <Power className="w-4 h-4" />;
  }
  if (upperType.includes("SWITCH")) {
    return <Settings className="w-4 h-4" />;
  }
  if (upperType.includes("METERING")) {
    return <Gauge className="w-4 h-4" />;
  }
  if (upperType.includes("MOTOR STARTER") || upperType.includes("STARTER")) {
    return <RotateCcw className="w-4 h-4" />;
  }
  if (upperType.includes("POWER SUPPLY")) {
    return <Battery className="w-4 h-4" />;
  }
  if (upperType.includes("PROTECTION")) {
    return <Shield className="w-4 h-4" />;
  }

  // Default icon for other types
  return <Zap className="w-4 h-4" />;
}

export function PanelDataImportForm({ projects }: PanelDataImportFormProps) {
  const [tabularData, setTabularData] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<ImportActionResult | null>(
    null
  );
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<
    string | null
  >(null);
  const [importedEquipmentData, setImportedEquipmentData] = useState<any[]>([]);

  const sampleData = `slno	panelname	item	subqty	typecode	height	width
01	MCC VIENTN	2000A 4P MDO ACB MP	1	ACB	750	1000
01	MCC VIENTN	3000VA 1ph CONTROL Transformer	2	SWITCH	600	500
01	MCC VIENTN	16A 2 Pole ON-Off Rotary Switch	4	SWITCH	300	0
01	MCC VIENTN	DOL starter 3ph 20HP/15KW	3	STARTE	600	500
01	MCC VIENTN	S/Delta Starter 25HP/18.5KW	2	STARTE	900	500`;

  const handleLoadSample = () => {
    setTabularData(sampleData);
    setValidationResult(null);
    setImportResult(null);
  };

  const handleValidate = async () => {
    if (!tabularData.trim()) {
      setValidationResult({
        valid: false,
        message: "No data to validate",
        rowCount: 0,
        errors: [],
      });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateTabularData(tabularData);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        message: `Validation error: ${error}`,
        rowCount: 0,
        errors: [String(error)],
      });
    }
    setIsValidating(false);
  };

  const handleImport = async () => {
    if (!selectedProjectId) {
      alert("Please select a project");
      return;
    }

    if (!tabularData.trim()) {
      alert("Please provide data to import");
      return;
    }

    setIsImporting(true);
    setImportResult(null);
    setSelectedEquipmentType(null);

    try {
      const formData = new FormData();
      formData.append("tabularData", tabularData);
      formData.append("projectId", selectedProjectId);

      const result = await importPanelEquipmentData(formData);
      setImportResult(result);

      // Parse and store equipment data for display
      if (result.success) {
        const lines = tabularData.trim().split("\n");
        const equipmentData = lines.slice(1).map((line, index) => {
          const columns = line.split("\t").map((col) => col.trim());
          return {
            id: index + 1,
            slno: columns[0] || (index + 1).toString().padStart(2, "0"),
            panelname: columns[1] || "",
            item: columns[2] || "",
            subqty: parseInt(columns[3]) || 1,
            typecode: columns[4] || "",
            height: parseInt(columns[5]) || 0,
            width: parseInt(columns[6]) || 0,
          };
        });
        setImportedEquipmentData(equipmentData);
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: `Import error: ${error}`,
        processed: 0,
        failed: 1,
        errors: [String(error)],
      });
    }
    setIsImporting(false);
  };

  const handleEquipmentTypeClick = (equipmentType: string | null) => {
    setSelectedEquipmentType(
      selectedEquipmentType === equipmentType ? null : equipmentType
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panel Equipment Data Import</CardTitle>
          <CardDescription>
            Import electrical equipment data in tabular format. Data should be
            tab-separated with columns: slno, panelname, item, subqty, typecode,
            height, width
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Select Project</Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tabularData">Tabular Data</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
              >
                Load Sample Data
              </Button>
            </div>
            <Textarea
              id="tabularData"
              placeholder="Paste your tab-separated data here..."
              value={tabularData}
              onChange={(e) => setTabularData(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleValidate}
              disabled={isValidating || !tabularData.trim()}
            >
              {isValidating ? "Validating..." : "Validate Data"}
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={
                isImporting || !tabularData.trim() || !selectedProjectId
              }
            >
              {isImporting ? "Importing..." : "Import Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Validation Results
              <Badge
                variant={validationResult.valid ? "default" : "destructive"}
              >
                {validationResult.valid ? "Valid" : "Invalid"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{validationResult.message}</p>
            {validationResult.rowCount > 0 && (
              <p className="text-sm text-muted-foreground mb-2">
                Found {validationResult.rowCount} equipment items
              </p>
            )}
            {validationResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationResult.errors.map(
                    (error: string, index: number) => (
                      <li key={index} className="text-red-600">
                        {error}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Import Results
              <Badge variant={importResult.success ? "default" : "destructive"}>
                {importResult.success ? "Success" : "Failed"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{importResult.message}</p>

            {importResult.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div
                  className={`text-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedEquipmentType === null
                      ? "bg-green-100 border-2 border-green-300"
                      : "bg-green-50 hover:bg-green-100"
                  }`}
                  onClick={() => handleEquipmentTypeClick(null)}
                >
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.summary.equipmentCreated}
                  </div>
                  <div className="text-sm text-green-600">
                    Equipment Created
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {importResult.summary.panelsCreated}
                  </div>
                  <div className="text-sm text-blue-600">Panels Created</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {importResult.summary.typesCreated.equipment +
                      importResult.summary.typesCreated.starter +
                      importResult.summary.typesCreated.breaker +
                      importResult.summary.typesCreated.feeder}
                  </div>
                  <div className="text-sm text-purple-600">Types Created</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {importResult.failed}
                  </div>
                  <div className="text-sm text-yellow-600">Failed Items</div>
                </div>
              </div>
            )}

            {/* Equipment Type Breakdown */}
            {importResult.summary?.equipmentTypeBreakdown && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Equipment Type Breakdown
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(
                    importResult.summary.equipmentTypeBreakdown
                  ).map(([type, count]) => (
                    <div
                      key={type}
                      className={`text-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedEquipmentType === type
                          ? "bg-blue-100 border-2 border-blue-300"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => handleEquipmentTypeClick(type)}
                    >
                      <div className="flex justify-center mb-1">
                        <div className="text-gray-500">
                          {getEquipmentTypeIcon(type)}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-700">
                        {count}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {importResult.errors.map((error, index) => (
                    <li key={index} className="text-red-600">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment Data Table */}
      {importResult?.success && importedEquipmentData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Equipment Data Details
              {selectedEquipmentType && (
                <Badge variant="secondary">
                  Filtered: {selectedEquipmentType}
                </Badge>
              )}
              {selectedEquipmentType === null && (
                <Badge variant="default">
                  All Equipment ({importedEquipmentData.length} items)
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {selectedEquipmentType
                ? `Showing equipment items for ${selectedEquipmentType}`
                : "Showing all imported equipment items"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              title=""
              data={importedEquipmentData.filter((item) => {
                if (!selectedEquipmentType) return true;

                // Filter based on equipment type detection
                const itemDescription = item.item.toUpperCase();
                const typeName = selectedEquipmentType.toUpperCase();

                if (
                  typeName.includes("CIRCUIT BREAKER") ||
                  typeName.includes("ACB") ||
                  typeName.includes("MCCB")
                ) {
                  return (
                    itemDescription.includes("ACB") ||
                    itemDescription.includes("MCCB")
                  );
                }
                if (typeName.includes("TRANSFORMER")) {
                  return itemDescription.includes("TRANSFORMER");
                }
                if (typeName.includes("SWITCH")) {
                  return (
                    itemDescription.includes("SWITCH") &&
                    !itemDescription.includes("STARTER")
                  );
                }
                if (typeName.includes("METERING")) {
                  return (
                    itemDescription.includes("METERING") ||
                    itemDescription.includes("AM/VM/IL")
                  );
                }
                if (
                  typeName.includes("MOTOR STARTER") ||
                  typeName.includes("STARTER")
                ) {
                  return itemDescription.includes("STARTER");
                }
                if (typeName.includes("POWER SUPPLY")) {
                  return (
                    itemDescription.includes("POWER SUPPLY") ||
                    itemDescription.includes("DC")
                  );
                }
                if (typeName.includes("PROTECTION")) {
                  return itemDescription.includes("MPCB");
                }

                return false;
              })}
              columns={[
                { key: "slno", label: "SL No", type: "text" },
                { key: "panelname", label: "Panel Name", type: "text" },
                { key: "item", label: "Equipment Description", type: "text" },
                { key: "subqty", label: "Quantity", type: "number" },
                { key: "typecode", label: "Type Code", type: "text" },
                { key: "height", label: "Height (mm)", type: "number" },
                { key: "width", label: "Width (mm)", type: "number" },
              ]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
