import * as t from "@babel/types";
import type { File } from "@babel/types";

export type TraversalNodeType =
  | "function"
  | "if"
  | "loop"
  | "expression";

export type SimplifiedAstNode = {
  type: TraversalNodeType;
  label: string;
  children: SimplifiedAstNode[];
  trueBranch?: SimplifiedAstNode[];
  falseBranch?: SimplifiedAstNode[];
};

export type SimplifiedAst = {
  nodes: SimplifiedAstNode[];
};

export type TraverseAstOptions = {
  maxDepth?: number;
};

const DEFAULT_MAX_DEPTH = 1200;

const getExpressionLabel = (expression: t.Expression): string => {
  if (t.isAssignmentExpression(expression)) {
    return `assignment:${expression.operator}`;
  }

  if (t.isCallExpression(expression)) {
    if (t.isIdentifier(expression.callee)) {
      return `call:${expression.callee.name}`;
    }

    if (t.isMemberExpression(expression.callee) && t.isIdentifier(expression.callee.property)) {
      return `call:${expression.callee.property.name}`;
    }

    return "call";
  }

  if (t.isUpdateExpression(expression)) {
    return `update:${expression.operator}`;
  }

  if (t.isBinaryExpression(expression) || t.isLogicalExpression(expression)) {
    return `operation:${expression.operator}`;
  }

  return expression.type;
};

const getLoopLabel = (
  node:
    | t.ForStatement
    | t.ForInStatement
    | t.ForOfStatement
    | t.WhileStatement
    | t.DoWhileStatement,
): string => {
  if (t.isForStatement(node)) return "for";
  if (t.isForInStatement(node)) return "for-in";
  if (t.isForOfStatement(node)) return "for-of";
  if (t.isDoWhileStatement(node)) return "do-while";
  return "while";
};

const extractFromNode = (
  node: t.Node,
  depth: number,
  maxDepth: number,
): SimplifiedAstNode[] => {
  if (depth > maxDepth) {
    return [];
  }

  if (t.isFunctionDeclaration(node)) {
    const bodyNodes = extractFromNode(node.body, depth + 1, maxDepth);
    return [
      {
        type: "function",
        label: node.id?.name ?? "anonymous",
        children: bodyNodes,
      },
    ];
  }

  if (t.isIfStatement(node)) {
    return [
      {
        type: "if",
        label: "if",
        children: [],
        trueBranch: extractFromNode(node.consequent, depth + 1, maxDepth),
        falseBranch: node.alternate
          ? extractFromNode(node.alternate, depth + 1, maxDepth)
          : [],
      },
    ];
  }

  if (
    t.isForStatement(node) ||
    t.isForInStatement(node) ||
    t.isForOfStatement(node) ||
    t.isWhileStatement(node) ||
    t.isDoWhileStatement(node)
  ) {
    return [
      {
        type: "loop",
        label: getLoopLabel(node),
        children: extractFromNode(node.body, depth + 1, maxDepth),
      },
    ];
  }

  if (t.isExpressionStatement(node)) {
    return [
      {
        type: "expression",
        label: getExpressionLabel(node.expression),
        children: [],
      },
    ];
  }

  if (t.isBlockStatement(node)) {
    return node.body.flatMap((statement) => extractFromNode(statement, depth + 1, maxDepth));
  }

  if (t.isProgram(node)) {
    return node.body.flatMap((statement) => extractFromNode(statement, depth + 1, maxDepth));
  }

  return [];
};

export const traverseAst = (
  ast: File,
  options: TraverseAstOptions = {},
): SimplifiedAst => {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;

  return {
    nodes: extractFromNode(ast.program, 0, maxDepth),
  };
};
