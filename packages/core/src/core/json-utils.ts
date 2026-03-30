export class JsonUtils {
  static isJsonObjectStillStreaming(spec: string) {
    let started = false;
    let insideString = false;
    let escaping = false;
    const stack: string[] = [];

    for (const char of spec) {
      if (!started) {
        if (JsonUtils.isWhitespace(char)) {
          continue;
        }

        if (char !== "{") {
          return false;
        }

        started = true;
        stack.push("}");
        continue;
      }

      if (insideString) {
        if (escaping) {
          escaping = false;
          continue;
        }

        if (char === "\\") {
          escaping = true;
          continue;
        }

        if (char === '"') {
          insideString = false;
        }

        continue;
      }

      if (char === '"') {
        insideString = true;
        continue;
      }

      if (char === "{") {
        stack.push("}");
        continue;
      }

      if (char === "[") {
        stack.push("]");
        continue;
      }

      if (char === "}" || char === "]") {
        const expected = stack.at(-1);
        if (expected !== char) {
          return false;
        }

        stack.pop();
        if (stack.length === 0) {
          continue;
        }
      }
    }

    return !started || insideString || stack.length > 0;
  }

  static isWhitespace(char: string) {
    return char === " " || char === "\n" || char === "\r" || char === "\t";
  }
}
