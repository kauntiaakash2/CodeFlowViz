import type { SimplifiedAst, SimplifiedAstNode } from "./astTraversal";

export type CfgNode = {
  id: string;
  type: "entry" | "exit" | "function" | "if" | "loop" | "expression" | "merge";
  label: string;
};

export type CfgEdge = {
  source: string;
  target: string;
  condition?: "true" | "false" | "next" | "loop";
};

export type ControlFlowGraph = {
  nodes: CfgNode[];
  edges: CfgEdge[];
};

type BuildContext = {
  nodes: CfgNode[];
  edges: CfgEdge[];
  nodeCounter: number;
};

type ExitPoint = {
  id: string;
  conditionToNext: CfgEdge["condition"];
};

const createNode = (
  context: BuildContext,
  type: CfgNode["type"],
  label: string,
): string => {
  const id = `n${context.nodeCounter++}`;
  context.nodes.push({ id, type, label });
  return id;
};

const connect = (
  context: BuildContext,
  exits: ExitPoint[],
  target: string,
  fallbackCondition: CfgEdge["condition"] = "next",
) => {
  exits.forEach(({ id, conditionToNext }) => {
    context.edges.push({
      source: id,
      target,
      condition: conditionToNext ?? fallbackCondition,
    });
  });
};

const buildSequence = (
  context: BuildContext,
  items: SimplifiedAstNode[],
  incoming: ExitPoint[],
): ExitPoint[] => {
  let currentIncoming = incoming;

  items.forEach((item) => {
    currentIncoming = buildNode(context, item, currentIncoming);
  });

  return currentIncoming;
};

const buildIfNode = (
  context: BuildContext,
  item: SimplifiedAstNode,
  incoming: ExitPoint[],
): ExitPoint[] => {
  const conditionId = createNode(context, "if", item.label);
  connect(context, incoming, conditionId);

  const mergeId = createNode(context, "merge", "merge");

  const trueBranch = item.trueBranch ?? [];
  if (trueBranch.length > 0) {
    const trueExits = buildSequence(
      context,
      trueBranch,
      [{ id: conditionId, conditionToNext: "true" }],
    );
    connect(context, trueExits, mergeId);
  } else {
    connect(context, [{ id: conditionId, conditionToNext: "true" }], mergeId);
  }

  const falseBranch = item.falseBranch ?? [];
  if (falseBranch.length > 0) {
    const falseExits = buildSequence(
      context,
      falseBranch,
      [{ id: conditionId, conditionToNext: "false" }],
    );
    connect(context, falseExits, mergeId);
  } else {
    connect(context, [{ id: conditionId, conditionToNext: "false" }], mergeId);
  }

  return [{ id: mergeId, conditionToNext: "next" }];
};

const buildLoopNode = (
  context: BuildContext,
  item: SimplifiedAstNode,
  incoming: ExitPoint[],
): ExitPoint[] => {
  const loopId = createNode(context, "loop", item.label);
  connect(context, incoming, loopId);

  if (item.children.length > 0) {
    const bodyExits = buildSequence(
      context,
      item.children,
      [{ id: loopId, conditionToNext: "true" }],
    );
    connect(context, bodyExits, loopId, "loop");
  }

  return [{ id: loopId, conditionToNext: "false" }];
};

const buildNode = (
  context: BuildContext,
  item: SimplifiedAstNode,
  incoming: ExitPoint[],
): ExitPoint[] => {
  if (item.type === "if") {
    return buildIfNode(context, item, incoming);
  }

  if (item.type === "loop") {
    return buildLoopNode(context, item, incoming);
  }

  const nodeId = createNode(context, item.type, item.label);
  connect(context, incoming, nodeId);

  if (item.type === "function" && item.children.length > 0) {
    return buildSequence(context, item.children, [{ id: nodeId, conditionToNext: "next" }]);
  }

  return [{ id: nodeId, conditionToNext: "next" }];
};

export const generateCfg = (simplifiedAst: SimplifiedAst): ControlFlowGraph => {
  const context: BuildContext = {
    nodes: [],
    edges: [],
    nodeCounter: 0,
  };

  const entryId = createNode(context, "entry", "entry");
  const exits = buildSequence(context, simplifiedAst.nodes, [{ id: entryId, conditionToNext: "next" }]);
  const exitId = createNode(context, "exit", "exit");

  connect(context, exits, exitId);

  return {
    nodes: context.nodes,
    edges: context.edges,
  };
};
