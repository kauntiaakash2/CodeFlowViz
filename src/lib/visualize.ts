import { traverseAst } from "./astTraversal";
import { generateCfg } from "./cfg";
import { formatCfgForGraph, type FormattedGraph } from "./graphFormatter";
import { parseCode, type ParseErrorDetails } from "./parser";

export type VisualizeSuccess = {
  success: true;
  data: FormattedGraph;
};

export type VisualizeFailure = {
  success: false;
  error: ParseErrorDetails | { message: string };
};

export type VisualizeResult = VisualizeSuccess | VisualizeFailure;

export const buildVisualizationGraph = (code: string): VisualizeResult => {
  const parsed = parseCode(code);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error,
    };
  }

  const simplifiedAst = traverseAst(parsed.ast);
  const cfg = generateCfg(simplifiedAst);
  const graph = formatCfgForGraph(cfg);

  return {
    success: true,
    data: graph,
  };
};
