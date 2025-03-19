import { ParseHandler } from '../../interface/parseHandler';

let parserHandler: ParseHandler | null = null;

export function setParserHandler(handler: ParseHandler): void {
  parserHandler = handler;
}

export function getParserHandler(): ParseHandler {
  if (!parserHandler) {
    throw new Error('Parser handler not set. Call setParserHandler first.');
  }
  return parserHandler;
}
