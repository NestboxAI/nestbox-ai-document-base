// Interface for handling parsing operations
export interface ParseHandler {
    /**
     * Parses input data and returns the parsed result.
     * @param input - Data to be parsed.
     *   - document (optional): Text content to be parsed.
     *   - url (optional): URL of the resource to parse.
     *   - type: Type or format of the input data.
     * @returns Parsed content as a string.
     */
    parse(input: { document?: string; url?: string; type: string }): Promise<string>;
  }
  