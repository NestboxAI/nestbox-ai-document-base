import { ParseHandler } from 'src/interface/parseHandler';

/**
 * Mock implementation of ParseHandler for testing purposes.
 */
export class MockParserHandler implements ParseHandler {
  /**
   * Parses input data and returns the parsed result.
   * In this mock implementation, we simply return the document with a prefix
   * or simulate fetching from a URL.
   */
  async parse(input: {
    url: string;
    type: string;
    options?: Record<string, any>;
  }): Promise<{ ids: string[]; documents: string[]; metadatas: object[] }> {
    // Check if required parameters are provided
    if (!input.url) {
      throw new Error('URL must be provided');
    }
    if (!input.type) {
      throw new Error('Type must be provided');
    }

    return {
      ids: ['doc-1', 'doc-2'],
      documents: [
        `Parsed document #1 from URL: ${input.url}`,
        `Parsed document #1 from URL: ${input.url}`,
      ],
      metadatas: [
        {
          source: input.url,
          chapter: 1,
        },
        {
          source: input.url,
          chapter: 2,
        },
      ],
    };
  }
}
