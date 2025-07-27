import React from "react";
import { Handle, Position } from "reactflow";

const HBBNode = () => {
  return (
    <div className="bg-blue-200 border-blue-400 border-2 rounded p-2 min-w-[120px] text-center">
      <div className="flex flex-col items-center">
        <span className="text-2xl mb-1">🔷</span>
        <div className="font-bold text-blue-900">HBB</div>
        <div className="text-xs text-blue-800">Horizontal Bus Bar</div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default HBBNode;
