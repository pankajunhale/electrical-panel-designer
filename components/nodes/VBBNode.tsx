import React from "react";
import { Handle, Position } from "reactflow";

const VBBNode = () => {
  return (
    <div className="bg-purple-200 border-purple-400 border-2 rounded p-2 min-w-[120px] text-center">
      <div className="flex flex-col items-center">
        <span className="text-2xl mb-1">🟪</span>
        <div className="font-bold text-purple-900">VBB</div>
        <div className="text-xs text-purple-800">Vertical Bus Bar</div>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default VBBNode;
