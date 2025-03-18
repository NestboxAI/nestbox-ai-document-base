// Interface for handling parsing operations
export interface ParseHandler {
  /**
   * Parses input data and returns the parsed result.
   * @param input - Data to be parsed.
   *   - url: URL of the resource to parse.
   *   - type: Type or format of the input data.
   *   - options: options given to the parser
   * @returns Parsed content as an array of docs to insert.
   */
  parse(input: {
    url: string;
    type: string;
    options?: Record<string, any>;
  }): Promise<{ ids: string[]; documents: string[]; metadatas: object[] }>;
}
