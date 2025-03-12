import { VectorHandler } from "src/interface/vectorHandler";

let vectorHandler: VectorHandler | null = null;

export function setVectorHandler(handler: VectorHandler): void {
  vectorHandler = handler;
}

export function getVectorHandler(): VectorHandler {
  if (!vectorHandler) {
    throw new Error('Vector handler not set. Call setVectorHandler first.');
  }
  return vectorHandler;
}