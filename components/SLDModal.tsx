import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import SingleLineDiagram from "@/components/SingleLineDiagram";

interface SLDModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wizardData: Array<{
    id?: string | number;
    type: string;
    x?: number;
    y?: number;
    label?: string;
  }>;
}

function layoutNodesGrid(
  data: Array<{
    id?: string | number;
    type: string;
    x?: number;
    y?: number;
    label?: string;
  }>,
  startX = 0,
  startY = 100,
  xGap = 250,
  yGap = 120,
  columns = 2
) {
  return data.map((item, idx) => ({
    ...item,
    x: startX + (idx % columns) * xGap,
    y: startY + Math.floor(idx / columns) * yGap,
  }));
}

export default function SLDModal({
  open,
  onOpenChange,
  wizardData,
}: SLDModalProps) {
  const positionedData = layoutNodesGrid(wizardData || []);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-[100%] max-w-none max-h-none p-0">
        <DialogHeader>
          <DialogTitle>Single Line Diagram</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="w-full h-[90vh] p-5 box-border flex items-center justify-center">
          <SingleLineDiagram data={positionedData} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
