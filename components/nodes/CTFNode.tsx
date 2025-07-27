import React from "react";
import { Handle, Position } from "reactflow";

const CTFNode = () => {
  return (
    <div className="bg-orange-200 border-orange-400 border-2 rounded p-2 min-w-[120px] text-center">
      <div className="flex flex-col items-center">
        <span className="text-2xl mb-1">🧲</span>
        <div className="font-bold text-orange-900">CTF</div>
        <div className="text-xs text-orange-800">
          Current Transformer Feeder
        </div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CTFNode;
