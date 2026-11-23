/**
 * astService.js  —  Phase 5: Abstract Syntax Tree Extraction
 * ─────────────────────────────────────────────────────────
 * Analyzes the structural semantics of the user's Python code:
 * extracts function names, loop counts, recursion, dictionary/set usage,
 * and error details to give the Socratic AI full contextual grounding.
 */

const { executeCode } = require('./sandboxService');

exports.extractAST = async (code) => {
  const pythonScript = `
import ast, json, sys

code_text = sys.stdin.read()
summary = {
    "functions": [],
    "loops": 0,
    "has_recursion": False,
    "uses_dict": False,
    "uses_set": False,
    "syntax_valid": True,
    "error": None
}

try:
    tree = ast.parse(code_text)
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            summary["functions"].append(node.name)
        elif isinstance(node, (ast.For, ast.While)):
            summary["loops"] += 1
        elif isinstance(node, (ast.Dict, ast.DictComp)):
            summary["uses_dict"] = True
        elif isinstance(node, (ast.Set, ast.SetComp)):
            summary["uses_set"] = True

    # Simple recursion check
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and hasattr(node.func, 'id'):
            if node.func.id in summary["functions"]:
                summary["has_recursion"] = True

except Exception as err:
    summary["syntax_valid"] = False
    summary["error"] = str(err)

print("AST_RESULT:" + json.dumps(summary))
`;

  try {
    const res = await executeCode(pythonScript, [{ input: code, expected_output: '' }], 'python');
    const out = res[0]?.stdout || '';
    const match = out.match(/AST_RESULT:(\{.*\})/);
    if (match) {
      return JSON.parse(match[1]);
    }
  } catch {
    // Fallback if AST extraction fails
  }

  // Pure JS heuristic fallback
  return {
    functions: (code.match(/def\s+([a-zA-Z_]\w*)/g) || []).map(f => f.replace('def ', '')),
    loops: (code.match(/\b(for|while)\b/g) || []).length,
    has_recursion: false,
    uses_dict: code.includes('{') || code.includes('dict'),
    uses_set: code.includes('set('),
    syntax_valid: true,
    error: null
  };
};
