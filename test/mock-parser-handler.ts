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
  async parse(input: { document?: string; url?: string; type: string }): Promise<string> {
    // Check if required parameters are provided
    if (!input.document && !input.url) {
      throw new Error('Either document or url must be provided');
    }

    if (!input.type) {
      throw new Error('Type must be provided');
    }

    // Handle different document types
    switch (input.type.toLowerCase()) {
      case 'text':
        return this.parseText(input);
      case 'html':
        return this.parseHtml(input);
      case 'json':
        return this.parseJson(input);
      case 'markdown':
        return this.parseMarkdown(input);
      default:
        throw new Error(`Unsupported document type: ${input.type}`);
    }
  }

  private parseText(input: { document?: string; url?: string; type: string }): string {
    if (input.document) {
      // Simply return the text with a mock processing indicator
      return `[PARSED_TEXT] ${input.document}`;
    } else if (input.url) {
      // Simulate fetching from URL
      return `[FETCHED_TEXT_FROM_URL] Mock content from ${input.url}`;
    }
    
    throw new Error('Invalid input for text parsing');
  }

  private parseHtml(input: { document?: string; url?: string; type: string }): string {
    if (input.document) {
      // Simulate HTML parsing by extracting text between tags (very simplified)
      return `[PARSED_HTML] ${input.document.replace(/<[^>]*>/g, ' ')}`;
    } else if (input.url) {
      // Simulate fetching and parsing HTML from URL
      return `[FETCHED_HTML_FROM_URL] Mock content from ${input.url}`;
    }
    
    throw new Error('Invalid input for HTML parsing');
  }

  private parseJson(input: { document?: string; url?: string; type: string }): string {
    if (input.document) {
      try {
        // Try to parse JSON and return a stringified version
        const parsed = JSON.parse(input.document);
        return `[PARSED_JSON] ${JSON.stringify(parsed, null, 2)}`;
      } catch (error) {
        throw new Error(`Invalid JSON: ${error.message}`);
      }
    } else if (input.url) {
      // Simulate fetching and parsing JSON from URL
      return `[FETCHED_JSON_FROM_URL] Mock content from ${input.url}`;
    }
    
    throw new Error('Invalid input for JSON parsing');
  }

  private parseMarkdown(input: { document?: string; url?: string; type: string }): string {
    if (input.document) {
      // Simulate Markdown parsing (very simplified)
      return `[PARSED_MARKDOWN] ${input.document.replace(/[#*_]/g, '')}`;
    } else if (input.url) {
      // Simulate fetching and parsing Markdown from URL
      return `[FETCHED_MARKDOWN_FROM_URL] Mock content from ${input.url}`;
    }
    
    throw new Error('Invalid input for Markdown parsing');
  }
}