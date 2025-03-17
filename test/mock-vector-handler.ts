import { VectorHandler } from 'src/interface/vectorHandler';

/**
 * Mock implementation of VectorHandler for testing purposes.
 * This can be used in both unit and integration tests.
 */
export class MockVectorHandler implements VectorHandler {
  // In-memory storage for collections and vectors
  private collections: Map<string, Map<string, any>> = new Map();
  
  async createCollection(name: string): Promise<void> {
    if (this.collections.has(name)) {
      throw new Error(`Collection "${name}" already exists`);
    }
    this.collections.set(name, new Map());
  }

  async deleteCollection(collectionId: string): Promise<void> {
    if (!this.collections.has(collectionId)) {
      throw new Error(`Collection "${collectionId}" not found`);
    }
    this.collections.delete(collectionId);
  }

  async listCollections(): Promise<string[]> {
    return Array.from(this.collections.keys());
  }

  async insertVector(
    collectionId: string,
    data: { id?: string; document?: string; url?: string; type?: string; metadata?: object }
  ): Promise<string> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      throw new Error(`Collection "${collectionId}" not found`);
    }

    // Generate a random ID if not provided
    const vectorId = data.id || `vec_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create a vector with an embedding (simplified for testing)
    const vector = {
      ...data,
      id: vectorId,
      embedding: [], // Simplified embedding for testing
      createdAt: new Date().toISOString()
    };

    collection.set(vectorId, vector);
    return vectorId;
  }

  async updateVector(
    collectionId: string,
    vectorId: string,
    data: { document?: string; url?: string; type?: string; metadata?: object }
  ): Promise<void> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      throw new Error(`Collection "${collectionId}" not found`);
    }

    const existingVector = collection.get(vectorId);
    if (!existingVector) {
      throw new Error(`Vector "${vectorId}" not found in collection "${collectionId}"`);
    }

    // Update the vector
    collection.set(vectorId, {
      ...existingVector,
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteVectorById(collectionId: string, vectorId: string): Promise<void> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      throw new Error(`Collection "${collectionId}" not found`);
    }

    if (!collection.has(vectorId)) {
      throw new Error(`Vector "${vectorId}" not found in collection "${collectionId}"`);
    }

    collection.delete(vectorId);
  }

  async deleteVectorsByFilter(collectionId: string, filter: object): Promise<number> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      throw new Error(`Collection "${collectionId}" not found`);
    }

    // Count vectors that match the filter
    let deletedCount = 0;
    
    // Very simple filtering logic (enhance for more complex use cases)
    for (const [id, vector] of collection.entries()) {
      if (this.matchesFilter(vector, filter)) {
        collection.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async getVectorById(collectionId: string, vectorId: string): Promise<any> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      throw new Error(`Collection "${collectionId}" not found`);
    }

    const vector = collection.get(vectorId);
    if (!vector) {
      return null; // Return null for not found to match service behavior
    }

    return vector;
  }

  async similaritySearch(
    collectionId: string,
    query: string,
    topK: number = 10,
    filter: object = {},
    include: string[] = []
  ): Promise<any[]> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      throw new Error(`Collection "${collectionId}" not found`);
    }

    // In a real implementation, this would perform vector similarity search
    // For testing, we'll do a simple string matching against the documents
    const results: any[] = [];
    
    for (const vector of collection.values()) {
      // Skip if it doesn't match the filter
      if (!this.matchesFilter(vector, filter)) {
        continue;
      }
      
      // Very simple "similarity" - check if query appears in document
      // In real implementation, this would be vector similarity calculation
      const similarity = vector.document && 
        typeof vector.document === 'string' && 
        vector.document.toLowerCase().includes(query.toLowerCase())
        ? 0.9 // Arbitrary high score for matching
        : 0.1; // Arbitrary low score for non-matching
      
      // Create result object
      const result: any = {
        id: vector.id,
        score: similarity
      };
      
      // Include requested fields
      if (include.length === 0 || include.includes('document')) {
        result.document = vector.document;
      }
      
      if (include.length === 0 || include.includes('metadata')) {
        result.metadata = vector.metadata;
      }
      
      results.push(result);
    }
    
    // Sort by score (highest first) and limit to topK
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // Helper method to check if a vector matches a filter
  private matchesFilter(vector: any, filter: object): boolean {
    // If no filter is provided, everything matches
    if (!filter || Object.keys(filter).length === 0) {
      return true;
    }
    
    // Simple filter matching logic
    for (const [key, value] of Object.entries(filter)) {
      // For metadata fields, check within the metadata object
      if (key.startsWith('metadata.')) {
        const metadataKey = key.substring('metadata.'.length);
        if (!vector.metadata || vector.metadata[metadataKey] !== value) {
          return false;
        }
      } else if (vector[key] !== value) {
        return false;
      }
    }
    
    return true;
  }
}