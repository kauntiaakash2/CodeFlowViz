import type { CfgEdge, CfgNode, ControlFlowGraph } from "./cfg";

export type FormattedGraphNode = {
  id: string;
  type: CfgNode["type"];
  label: string;
  position: {
    x: number;
    y: number;
  };
};

export type FormattedGraphEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type FormattedGraph = {
  nodes: FormattedGraphNode[];
  edges: FormattedGraphEdge[];
};

export type GraphLayoutOptions = {
  horizontalGap?: number;
  verticalGap?: number;
};

const DEFAULT_LAYOUT: Required<GraphLayoutOptions> = {
  horizontalGap: 260,
  verticalGap: 120,
};

const buildDepthMap = (graph: ControlFlowGraph): Map<string, number> => {
  const adjacency = new Map<string, string[]>();
  graph.nodes.forEach((node) => {
    adjacency.set(node.id, []);
  });

  graph.edges.forEach((edge) => {
    const neighbors = adjacency.get(edge.source);
    if (neighbors) {
      neighbors.push(edge.target);
    }
  });

  const entryNode = graph.nodes.find((node) => node.type === "entry") ?? graph.nodes[0];
  if (!entryNode) {
    return new Map<string, number>();
  }

  const depthMap = new Map<string, number>([[entryNode.id, 0]]);
  const queue = [entryNode.id];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const currentDepth = depthMap.get(current) ?? 0;
    const neighbors = adjacency.get(current) ?? [];

    neighbors.forEach((target) => {
      const existing = depthMap.get(target);
      const nextDepth = currentDepth + 1;

      if (existing === undefined || nextDepth < existing) {
        depthMap.set(target, nextDepth);
        queue.push(target);
      }
    });
  }

  graph.nodes.forEach((node) => {
    if (!depthMap.has(node.id)) {
      depthMap.set(node.id, 0);
    }
  });

  return depthMap;
};

const buildFormattedNodes = (
  graph: ControlFlowGraph,
  options: Required<GraphLayoutOptions>,
): FormattedGraphNode[] => {
  const depthMap = buildDepthMap(graph);
  const rowsByDepth = new Map<number, number>();

  return graph.nodes.map((node) => {
    const depth = depthMap.get(node.id) ?? 0;
    const row = rowsByDepth.get(depth) ?? 0;
    rowsByDepth.set(depth, row + 1);

    return {
      id: node.id,
      type: node.type,
      label: node.label,
      position: {
        x: depth * options.horizontalGap,
        y: row * options.verticalGap,
      },
    };
  });
};

const buildFormattedEdges = (edges: CfgEdge[]): FormattedGraphEdge[] => {
  return edges.map((edge, index) => ({
    id: `e${index}-${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    label: edge.condition,
  }));
};

export const formatCfgForGraph = (
  graph: ControlFlowGraph,
  layoutOptions: GraphLayoutOptions = {},
): FormattedGraph => {
  const options: Required<GraphLayoutOptions> = {
    horizontalGap: layoutOptions.horizontalGap ?? DEFAULT_LAYOUT.horizontalGap,
    verticalGap: layoutOptions.verticalGap ?? DEFAULT_LAYOUT.verticalGap,
  };

  return {
    nodes: buildFormattedNodes(graph, options),
    edges: buildFormattedEdges(graph.edges),
  };
};
