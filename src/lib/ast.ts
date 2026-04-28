import traverse from "@babel/traverse";
import * as t from "@babel/types";
import dagre from "dagre";
import { Edge, MarkerType, Node } from "reactflow";
import { parseCode } from "./parser";

export type VariableSnapshot = Record<string, unknown>;

export type FlowStep = {
  id: string;
  label: string;
  detail?: string;
  variables: VariableSnapshot;
  type: "assignment" | "condition" | "loop" | "return" | "call" | "info";
};

export type FlowNodeData = {
  label: string;
  detail?: string;
  stepIndex: number;
  variables: VariableSnapshot;
  type: FlowStep["type"];
};

export type Language = "javascript" | "cpp";

const evaluateExpression = (
  node: t.Expression | t.PatternLike | null | undefined,
  scope: VariableSnapshot,
): unknown => {
  if (!node) return undefined;
  if (t.isNumericLiteral(node) || t.isStringLiteral(node) || t.isBooleanLiteral(node)) {
    return node.value;
  }
  if (t.isNullLiteral(node)) return null;
  if (t.isIdentifier(node)) return scope[node.name];
  if (t.isArrayExpression(node)) {
    return node.elements.map((el) =>
      t.isExpression(el) || t.isSpreadElement(el)
        ? evaluateExpression(el as t.Expression, scope)
        : undefined,
    );
  }
  if (t.isObjectExpression(node)) {
    const obj: Record<string, unknown> = {};
    node.properties.forEach((prop) => {
      if (t.isObjectProperty(prop)) {
        const key = t.isIdentifier(prop.key)
          ? prop.key.name
          : t.isStringLiteral(prop.key)
            ? prop.key.value
            : undefined;
        if (!key) return;
        obj[key] = evaluateExpression(
          prop.value as t.Expression | t.PatternLike,
          scope,
        );
      }
    });
    return obj;
  }
  if (t.isUnaryExpression(node)) {
    const arg = evaluateExpression(node.argument as t.Expression, scope);
    switch (node.operator) {
      case "-":
        return typeof arg === "number" ? -arg : undefined;
      case "+":
        return typeof arg === "number" ? +arg : undefined;
      case "!":
        return !arg;
      default:
        return undefined;
    }
  }
  if (t.isBinaryExpression(node)) {
    const left = evaluateExpression(node.left as t.Expression, scope);
    const right = evaluateExpression(node.right as t.Expression, scope);
    if (typeof left === "number" && typeof right === "number") {
      switch (node.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return right !== 0 ? left / right : undefined;
      }
    }
    if (typeof left === "string" || typeof right === "string") {
      if (node.operator === "+") return `${left ?? ""}${right ?? ""}`;
    }
    if ("===" === node.operator || "!==" === node.operator || "==" === node.operator) {
      return node.operator === "!==" ? left !== right : left == right;
    }
    if (node.operator === ">" || node.operator === "<" || node.operator === ">=" || node.operator === "<=") {
      if (typeof left === "number" && typeof right === "number") {
        switch (node.operator) {
          case ">":
            return left > right;
          case "<":
            return left < right;
          case ">=":
            return left >= right;
          case "<=":
            return left <= right;
        }
      }
    }
    return undefined;
  }
  if (t.isLogicalExpression(node)) {
    const left = evaluateExpression(node.left as t.Expression, scope);
    const right = evaluateExpression(node.right as t.Expression, scope);
    switch (node.operator) {
      case "&&":
        return left && right;
      case "||":
        return left || right;
      case "??":
        return left ?? right;
      default:
        return undefined;
    }
  }
  if (t.isConditionalExpression(node)) {
    const test = evaluateExpression(node.test as t.Expression, scope);
    return test
      ? evaluateExpression(node.consequent as t.Expression, scope)
      : evaluateExpression(node.alternate as t.Expression, scope);
  }
  if (t.isMemberExpression(node) && t.isIdentifier(node.object) && t.isIdentifier(node.property)) {
    const obj = scope[node.object.name] as Record<string, unknown> | undefined;
    return obj ? obj[node.property.name] : undefined;
  }
  return undefined;
};

const getSnippet = (code: string, node: t.Node) => {
  if (node.start === null || node.end === null) return "";
  return code.slice(node.start, node.end);
};

export const addEdgeMarkers = (
  steps: FlowStep[],
): { nodes: Node<FlowNodeData>[]; edges: Edge[] } => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 90 });
  g.setDefaultEdgeLabel(() => ({}));

  steps.forEach((step) => {
    g.setNode(step.id, { width: 260, height: 120 });
  });

  steps.forEach((step, idx) => {
    if (idx === 0) return;
    g.setEdge(steps[idx - 1].id, step.id);
  });

  dagre.layout(g);

  const nodes: Node<FlowNodeData>[] = steps.map((step, idx) => {
    const pos = g.node(step.id);
    return {
      id: step.id,
      position: { x: pos.x - pos.width / 2, y: pos.y - pos.height / 2 },
      data: {
        label: step.label,
        detail: step.detail,
        variables: step.variables,
        stepIndex: idx,
        type: step.type,
      },
      style: {
        background: "#101010",
        border: "1px solid #1f1f1f",
        borderRadius: 14,
        color: "#f5f5f5",
        padding: 12,
        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
      },
    };
  });

  const edges: Edge[] = steps.slice(1).map((step, idx) => ({
    id: `e-${steps[idx].id}-${step.id}`,
    source: steps[idx].id,
    target: step.id,
    animated: true,
    style: { stroke: "#ff6b00", strokeWidth: 1.6 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#ff6b00" },
  }));

  return { nodes, edges };
};

const buildFlowJs = (
  code: string,
): { steps: FlowStep[]; nodes: Node<FlowNodeData>[]; edges: Edge[] } => {
  const parseResult = parseCode(code);
  if (!parseResult.success) {
    const steps: FlowStep[] = [
      {
        id: "parse-error",
        label: "Syntax error",
        detail: `${parseResult.error.message}${
          parseResult.error.line !== undefined && parseResult.error.column !== undefined
            ? ` (line ${parseResult.error.line}, column ${parseResult.error.column})`
            : ""
        }`,
        variables: {},
        type: "info",
      },
    ];
    const { nodes, edges } = addEdgeMarkers(steps);
    return { steps, nodes, edges };
  }

  const ast = parseResult.ast;

  const scope: VariableSnapshot = {};
  const steps: FlowStep[] = [];

  const pushStep = (
    label: string,
    detail: string | undefined,
    type: FlowStep["type"],
  ) => {
    steps.push({
      id: `step-${steps.length}`,
      label,
      detail,
      variables: { ...scope },
      type,
    });
  };

  traverse(ast, {
    VariableDeclarator(path) {
      if (!t.isIdentifier(path.node.id)) return;
      const name = path.node.id.name;
      const value = evaluateExpression(path.node.init as t.Expression, scope);
      scope[name] = value;
      pushStep(`Set ${name}`, `Initialized with ${String(value)}`, "assignment");
    },
    AssignmentExpression(path) {
      if (t.isIdentifier(path.node.left)) {
        const name = path.node.left.name;
        const value = evaluateExpression(path.node.right as t.Expression, scope);
        scope[name] = value;
        pushStep(`Update ${name}`, `Assigned ${getSnippet(code, path.node)}`, "assignment");
      }
    },
    UpdateExpression(path) {
      if (t.isIdentifier(path.node.argument)) {
        const name = path.node.argument.name;
        const current = scope[name];
        if (typeof current === "number") {
          scope[name] = path.node.operator === "++" ? current + 1 : current - 1;
        }
        pushStep(`Update ${name}`, `${name}${path.node.operator}`, "assignment");
      }
    },
    IfStatement(path) {
      const testSnippet = getSnippet(code, path.node.test);
      pushStep(`If (${testSnippet})`, "Branch condition", "condition");
    },
    ForStatement(path) {
      pushStep("For loop", getSnippet(code, path.node), "loop");
    },
    WhileStatement(path) {
      pushStep("While loop", getSnippet(code, path.node.test), "loop");
    },
    ForOfStatement(path) {
      const left = t.isVariableDeclaration(path.node.left)
        ? path.node.left.declarations[0]?.id
        : path.node.left;
      const iter = getSnippet(code, path.node.right);
      const name = t.isIdentifier(left) ? left.name : "item";
      pushStep(`Iterate ${name}`, `for...of ${iter}`, "loop");
    },
    ReturnStatement(path) {
      const value = evaluateExpression(path.node.argument as t.Expression, scope);
      pushStep("Return", `Returns ${value ?? "value"}`, "return");
    },
    ExpressionStatement(path) {
      if (t.isCallExpression(path.node.expression)) {
        const callee = path.node.expression.callee;
        const name = t.isIdentifier(callee)
          ? callee.name
          : t.isMemberExpression(callee) && t.isIdentifier(callee.property)
            ? callee.property.name
            : "function";
        pushStep(`Call ${name}()`, getSnippet(code, path.node.expression), "call");
      }
    },
  });

  if (steps.length === 0) {
    pushStep("No executable statements", "Add code to visualize the flow", "info");
  }

  const { nodes, edges } = addEdgeMarkers(steps);
  return { steps, nodes, edges };
};

const evaluateCppExpression = (raw: string, scope: VariableSnapshot): unknown => {
  const expr = raw.trim();
  if (expr === "true") return true;
  if (expr === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(expr)) return Number(expr);
  if (/^".*"$/.test(expr) || /^'.*'$/.test(expr)) return expr.slice(1, -1);
  if (/^[a-zA-Z_]\w*$/.test(expr)) return scope[expr];
  const addMatch = expr.match(/^([a-zA-Z_]\w*|[-]?\d+(?:\.\d+)?)[ ]*([+\-])[ ]*([a-zA-Z_]\w*|[-]?\d+(?:\.\d+)?)/);
  if (addMatch) {
    const [, leftRaw, op, rightRaw] = addMatch;
    const left = evaluateCppExpression(leftRaw, scope);
    const right = evaluateCppExpression(rightRaw, scope);
    if (typeof left === "number" && typeof right === "number") {
      return op === "+" ? left + right : left - right;
    }
  }
  return undefined;
};

const buildFlowCpp = (
  code: string,
): { steps: FlowStep[]; nodes: Node<FlowNodeData>[]; edges: Edge[] } => {
  const lines = code.split(/\r?\n/);
  const scope: VariableSnapshot = {};
  const steps: FlowStep[] = [];

  const pushStep = (
    label: string,
    detail: string | undefined,
    type: FlowStep["type"],
  ) => {
    steps.push({
      id: `cpp-${steps.length}`,
      label,
      detail,
      variables: { ...scope },
      type,
    });
  };

  const varDecl = /^(?:\s*(?:int|float|double|string|bool|auto)\s+)([a-zA-Z_]\w*)\s*(?:=\s*([^;]+))?\s*;/;
  const assign = /^\s*([a-zA-Z_]\w*)\s*=\s*([^;]+);/;
  const ifStmt = /^\s*if\s*\((.+)\)/;
  const forStmt = /^\s*for\s*\((.+)\)/;
  const whileStmt = /^\s*while\s*\((.+)\)/;
  const returnStmt = /^\s*return\s+([^;]+);/;
  const callStmt = /^\s*([a-zA-Z_]\w*)\s*\(([^;]*)\)\s*;/;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (varDecl.test(trimmed)) {
      const match = trimmed.match(varDecl);
      if (match) {
        const [, name, rawValue] = match;
        const value = rawValue ? evaluateCppExpression(rawValue, scope) : undefined;
        scope[name] = value;
        pushStep(`Set ${name}`, `Initialized with ${String(value ?? "undefined")}`, "assignment");
        return;
      }
    }

    if (assign.test(trimmed)) {
      const match = trimmed.match(assign);
      if (match) {
        const [, name, rawValue] = match;
        const value = evaluateCppExpression(rawValue, scope);
        scope[name] = value;
        pushStep(`Update ${name}`, `Assigned ${rawValue.trim()}`, "assignment");
        return;
      }
    }

    if (forStmt.test(trimmed)) {
      const match = trimmed.match(forStmt);
      pushStep("For loop", match ? match[1] : "for (...)", "loop");
      return;
    }

    if (whileStmt.test(trimmed)) {
      const match = trimmed.match(whileStmt);
      pushStep("While loop", match ? match[1] : "while (...)", "loop");
      return;
    }

    if (ifStmt.test(trimmed)) {
      const match = trimmed.match(ifStmt);
      pushStep(`If (${match ? match[1] : "condition"})`, "Branch condition", "condition");
      return;
    }

    if (returnStmt.test(trimmed)) {
      const match = trimmed.match(returnStmt);
      const value = match ? evaluateCppExpression(match[1], scope) : undefined;
      pushStep("Return", `Returns ${value ?? "value"}`, "return");
      return;
    }

    if (callStmt.test(trimmed) && !trimmed.startsWith("for") && !trimmed.startsWith("if")) {
      const match = trimmed.match(callStmt);
      if (match) {
        const [, name] = match;
        pushStep(`Call ${name}()`, trimmed, "call");
        return;
      }
    }
  });

  if (steps.length === 0) {
    pushStep("No executable statements", "Add C++ code to visualize the flow", "info");
  }

  const { nodes, edges } = addEdgeMarkers(steps);
  return { steps, nodes, edges };
};

export const buildFlow = (
  code: string,
  language: Language = "javascript",
): { steps: FlowStep[]; nodes: Node<FlowNodeData>[]; edges: Edge[] } => {
  if (language === "cpp") {
    return buildFlowCpp(code);
  }
  return buildFlowJs(code);
};
