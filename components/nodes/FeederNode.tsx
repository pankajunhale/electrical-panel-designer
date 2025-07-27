import React from "react";
import { Handle, Position } from "reactflow";

const FeederNode = () => {
  return (
    <div className="bg-yellow-200 border-yellow-400 border-2 rounded p-2 min-w-[120px] text-center">
      <div className="flex flex-col items-center">
        <span className="text-2xl mb-1">⚡</span>
        <div className="font-bold text-yellow-900">Feeder</div>
        <div className="text-xs text-yellow-800">Outgoing Feeder</div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default FeederNode;
