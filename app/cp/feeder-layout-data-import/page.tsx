import FeederLayoutDataImportForm from "@/components/forms/FeederLayoutDataImportForm";

export default function FeederLayoutDataImportPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Feeder Layout Data Import</h1>
        <p className="text-muted-foreground mt-2">
          Import default feeder layouts for all existing feeders in the system.
        </p>
      </div>

      <FeederLayoutDataImportForm />
    </div>
  );
}
