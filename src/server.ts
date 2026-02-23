import { Interpreter } from "./modules/interpreter/interpreter";
import { Tokenizer } from "./modules/lexer/tokenizer";
import { Parser } from "./modules/parser/parser";
import { join } from "path";

const PORT = parseInt(process.env["PORT"] ?? "3000");
const WEB_DIST = join(import.meta.dir, "../web/dist");

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function handleRun(req: Request): Promise<Response> {
  let body: { code?: string; stdin?: string };

  try {
    body = await req.json();
  } catch {
    return Response.json(
      { output: "", error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const code = body.code ?? "";
  const stdinRaw = body.stdin ?? "";
  const stdinLines = stdinRaw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let ast = null;
  try {
    const lexer = new Tokenizer(false);
    const parser = new Parser(false);
    const interpreter = new Interpreter(stdinLines);

    const tokens = lexer.tokenize(code);
    ast = parser.parse(tokens);
    const output = interpreter.interpret(ast);

    return Response.json(
      { output, ast, error: null },
      { headers: corsHeaders() },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { output: "", ast, error: message },
      { headers: corsHeaders() },
    );
  }
}

async function serveStatic(pathname: string): Promise<Response> {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = join(WEB_DIST, safePath);

  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    const fallback = Bun.file(join(WEB_DIST, "index.html"));
    if (await fallback.exists()) {
      return new Response(fallback, { headers: corsHeaders() });
    }
    return new Response("Not found", { status: 404 });
  }

  return new Response(file, { headers: corsHeaders() });
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (req.method === "POST" && url.pathname === "/run") {
      return handleRun(req);
    }

    return serveStatic(url.pathname);
  },
});

console.log(`Bisaya++ server running at http://localhost:${PORT}`);
