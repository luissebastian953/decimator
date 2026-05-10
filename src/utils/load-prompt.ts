import { readFileSync } from "fs";
import { join } from "path";

export function loadPrompt(name: string): string {
  return readFileSync(join(process.cwd(), "prompts", `${name}.md`), "utf-8").trim();
}
