import React from "react";
import { Handle, Position } from "reactflow";

const IncomerNode = () => {
  return (
    <div className="bg-red-200 border-red-400 border-2 rounded p-2 min-w-[120px] text-center">
      <div className="flex flex-col items-center">
        <span className="text-2xl mb-1">🔌</span>
        <div className="font-bold text-red-900">Incomer</div>
        <div className="text-xs text-red-800">Incoming Supply</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default IncomerNode;
