import React from "react";
import { Handle, Position } from "reactflow";

const SPARENode = () => {
  return (
    <div className="bg-gray-200 border-gray-400 border-2 rounded p-2 min-w-[120px] text-center">
      <div className="flex flex-col items-center">
        <span className="text-2xl mb-1">⬜</span>
        <div className="font-bold text-gray-900">SPARE</div>
        <div className="text-xs text-gray-800">Spare Compartment</div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default SPARENode;
