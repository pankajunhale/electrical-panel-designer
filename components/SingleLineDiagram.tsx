import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import HBBNode from "@/components/nodes/HBBNode";
import VBBNode from "@/components/nodes/VBBNode";
import IncomerNode from "@/components/nodes/IncomerNode";
import FeederNode from "@/components/nodes/FeederNode";
import CTFNode from "@/components/nodes/CTFNode";
import CBCNode from "@/components/nodes/CBCNode";
import SPARENode from "@/components/nodes/SPARENode";

const nodeTypes = {
  HBB: HBBNode,
  VBB: VBBNode,
  incomer: IncomerNode,
  feeder: FeederNode,
  CTF: CTFNode,
  CBC: CBCNode,
  SPARE: SPARENode,
};

function mapDataToNodesAndEdges(
  data: Array<{
    id?: string | number;
    type: string;
    x?: number;
    y?: number;
    label?: string;
  }>
) {
  const nodes = data.map((item, idx) => ({
    id: item.id ? String(item.id) : String(idx),
    type: item.type, // must match a key in nodeTypes
    position: { x: item.x ?? idx * 180, y: item.y ?? 100 },
    data: { label: item.label, ...item },
  }));
  const edges = data.slice(1).map((item, idx) => {
    const sourceId = data[idx]?.id ? String(data[idx].id) : String(idx);
    const targetId = item?.id ? String(item.id) : String(idx + 1);
    return {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      animated: true,
    };
  });
  return { nodes, edges };
}

const SingleLineDiagram = ({
  data,
}: {
  data: Array<{
    id?: string | number;
    type: string;
    x?: number;
    y?: number;
    label?: string;
  }>;
}) => {
  const { nodes, edges } = mapDataToNodesAndEdges(data || []);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default SingleLineDiagram;
