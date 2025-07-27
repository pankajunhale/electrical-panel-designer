import React from "react";
import { Handle, Position } from "reactflow";

const CBCNode = () => {
  return (
    <div className="bg-green-200 border-green-400 border-2 rounded p-2 min-w-[120px] text-center">
      <div className="flex flex-col items-center">
        <span className="text-2xl mb-1">🟩</span>
        <div className="font-bold text-green-900">CBC</div>
        <div className="text-xs text-green-800">Capacitor Bank Compartment</div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CBCNode;
