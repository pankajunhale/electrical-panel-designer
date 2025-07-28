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

interface Project {
  id: string;
  name: string;
}

interface PanelDataImportFormProps {
  projects: Project[];
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

    try {
      const formData = new FormData();
      formData.append("tabularData", tabularData);
      formData.append("projectId", selectedProjectId);

      const result = await importPanelEquipmentData(formData);
      setImportResult(result);
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
                <div className="text-center p-3 bg-green-50 rounded-lg">
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
    </div>
  );
}
