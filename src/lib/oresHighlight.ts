const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const grammar =
  /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\`(?:\\.|[^\`\\])*\`)|(?<number>\b\d+(?:\.\d+)?(?:ms|s|m|h)?\b)|(?<keyword>\b(?:define|actor|shared|private|untrusted|module|class|trait|struct|interface|contract|requires|pub|fnc|routine|async|await|return|const|mut|val|let|infer|match|on|switch|case|select|when|do|nb|readch|writech|spawn|is|as|with|if|fi|else|import|from|type|stop|done|recover|defer|pure|trap|nlex|gpu|quantum|cancelled|timeout)\b)|(?<type>\b(?:String|string|Int|int|Bool|bool|Future|ActorRef|Option|Result|Tuple|Map|List|void)\b)|(?<symbol>@[A-Za-z_]\w*|\b[A-Z][A-Za-z0-9_]*\b)|(?<operator>->|=>|::|:=|==|!=|<=|>=|\|\||&&|[=+\-*\/<>!?])/g;

export function highlightOres(code: string): string {
  let output = "";
  let cursor = 0;

  for (const match of code.matchAll(grammar)) {
    const index = match.index ?? 0;
    output += escapeHtml(code.slice(cursor, index));

    const kind = Object.entries(match.groups ?? {}).find(([, value]) => value !== undefined)?.[0] ?? "plain";
    output += `<span class="tok-${kind}">${escapeHtml(match[0])}</span>`;
    cursor = index + match[0].length;
  }

  output += escapeHtml(code.slice(cursor));
  return output;
}
