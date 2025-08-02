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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  importDefaultFeederLayouts,
  getFeederLayoutStatistics,
  type FeederLayoutImportResult,
} from "@/actions/feeder-layout-data-import";
import {
  Loader2,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function FeederLayoutDataImportForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] =
    useState<FeederLayoutImportResult | null>(null);
  const [statistics, setStatistics] = useState<{
    totalLayouts: number;
    totalFeeders: number;
    feedersWithLayouts: number;
    feedersWithoutLayouts: number;
  } | null>(null);

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const result = await importDefaultFeederLayouts();
      setImportResult(result);

      // Refresh statistics after import
      const stats = await getFeederLayoutStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error importing feeder layouts:", error);
      setImportResult({
        success: false,
        message: "An unexpected error occurred during import.",
        createdCount: 0,
        totalFeeders: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getFeederLayoutStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  // Load statistics on component mount
  useState(() => {
    loadStatistics();
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Feeder Layout Data Import
          </CardTitle>
          <CardDescription>
            Import default feeder layouts for all existing feeders. This will
            create a default layout for each feeder that doesn't already have
            one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistics Display */}
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.totalFeeders}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Feeders
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statistics.feedersWithLayouts}
                </div>
                <div className="text-sm text-muted-foreground">
                  With Layouts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {statistics.feedersWithoutLayouts}
                </div>
                <div className="text-sm text-muted-foreground">
                  Without Layouts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {statistics.totalLayouts}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Layouts
                </div>
              </div>
            </div>
          )}

          {/* Import Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleImport}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isLoading ? "Importing..." : "Import Default Feeder Layouts"}
            </Button>

            <Button
              variant="outline"
              onClick={loadStatistics}
              disabled={isLoading}
            >
              Refresh Statistics
            </Button>
          </div>

          {/* Import Result */}
          {importResult && (
            <div
              className={`p-4 rounded-lg border ${
                importResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      importResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {importResult.message}
                  </div>
                  {importResult.success && (
                    <div className="mt-2 space-y-1 text-sm text-green-700">
                      <div>Created: {importResult.createdCount} layouts</div>
                      <div>Total feeders: {importResult.totalFeeders}</div>
                      {importResult.statistics && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              Total Layouts:{" "}
                              {importResult.statistics.totalLayouts}
                            </div>
                            <div>
                              Feeders with Layouts:{" "}
                              {importResult.statistics.feedersWithLayouts}
                            </div>
                            <div>
                              Feeders without Layouts:{" "}
                              {importResult.statistics.feedersWithoutLayouts}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Information Panel */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-blue-800 mb-2">
                  How it works:
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Loops through all existing feeders in the database</li>
                  <li>
                    • Creates a default layout for each feeder that doesn't have
                    one
                  </li>
                  <li>
                    • Uses feeder ID as the reference key for the feeder_layout
                    table
                  </li>
                  <li>
                    • Sets default position (x=0, y=0), size (width=100,
                    height=50), and view type (front)
                  </li>
                  <li>
                    • Skips feeders that already have layouts to avoid
                    duplicates
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
