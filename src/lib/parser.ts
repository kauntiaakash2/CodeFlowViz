import { parse, type ParserOptions } from "@babel/parser";
import type { File } from "@babel/types";

export type ParseErrorDetails = {
  message: string;
  reasonCode?: string;
  line?: number;
  column?: number;
};

export type ParseResult =
  | {
      success: true;
      ast: File;
      error: null;
    }
  | {
      success: false;
      ast: null;
      error: ParseErrorDetails;
    };

const parserOptions: ParserOptions = {
  sourceType: "unambiguous",
  errorRecovery: false,
  plugins: [],
};

const buildParseError = (error: unknown): ParseErrorDetails => {
  const fallbackMessage = "Unable to parse code";

  if (!(error instanceof Error)) {
    return { message: fallbackMessage };
  }

  const parserError = error as Error & {
    loc?: { line?: number; column?: number };
    reasonCode?: string;
  };

  return {
    message: parserError.message || fallbackMessage,
    reasonCode: parserError.reasonCode,
    line: parserError.loc?.line,
    column: parserError.loc?.column,
  };
};

const ensureStringInput = (code: string): ParseResult | null => {
  if (typeof code === "string") {
    return null;
  }

  return {
    success: false,
    ast: null,
    error: {
      message: "Invalid parser input. Expected a JavaScript source string.",
    },
  };
};

export const parseCode = (code: string): ParseResult => {
  const inputValidation = ensureStringInput(code);
  if (inputValidation) {
    return inputValidation;
  }

  try {
    const ast = parse(code, parserOptions);
    return {
      success: true,
      ast,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      ast: null,
      error: buildParseError(error),
    };
  }
};
