// Interface for handling vector operations within collections
export interface VectorHandler {
  /**
   * Retrieves a list of all collection identifiers.
   * @returns Array of collection names or IDs.
   */
  listCollections(): Promise<string[]>;

  /**
   * Creates a new vector collection.
   * @param name - Name of the collection to be created.
   * @param metadata - Metadata associated with the collection.
   */
  createCollection(name: string, metadata: Record<string, any>): Promise<void>;

  /**
   * Updates a collection.
   * @param collectionId - Rename of the collection
   * @param metadata - Metadata associated with the collection.
   */
  updateCollection(
    previousId: string,
    collectionId: string,
    metadata: Record<string, any>,
  ): Promise<void>;

  /**
   * Deletes an existing vector collection by its ID.
   * @param collectionId - Unique identifier of the collection.
   */
  deleteCollection(collectionId: string): Promise<void>;

  /**
   * Get a collection info and metadata by its ID.
   * @param collectionId - Unique identifier of the collection.
   */
  getCollection(collectionId: string): Promise<any>;

  /**
   * Inserts a new vector into a specified collection.
   * @param collectionId - ID of the collection.
   * @param data - Vector data to insert.
   *   - id (optional): Unique identifier for the vector.
   *   - document (optional): Text content associated with the vector.
   *   - metadata (optional): Additional metadata associated with the vector.
   * @returns The ID of the newly inserted vector.
   */
  insertVector(
    collectionId: string,
    data: {
      id?: string;
      document?: string;
      metadata?: object;
    },
  ): Promise<string>;

  /**
   * Inserts a batch of vectors into a specified collection.
   * @param collectionId - ID of the collection.
   * @param data - Vector data to insert.
   *   - ids: Unique identifiers for the vectors.
   *   - documents (optional): Text content associated with the vectors.
   *   - metadatas (optional): Additional metadatas associated with the vector.
   * @returns The IDs of the newly inserted vectors.
   */
  batchInsertVectors(
    collectionId: string,
    data: {
      ids: string[];
      documents?: string[];
      metadatas?: object[];
    },
  ): Promise<string[]>;

  /**
   * Updates an existing vector within a collection.
   * @param collectionId - ID of the collection.
   * @param vectorId - Unique identifier of the vector to update.
   * @param data - Updated data fields for the vector.
   *   - document (optional): New text content.
   *   - url (optional): Updated URL reference.
   *   - type (optional): Updated type or category.
   *   - metadata (optional): Updated metadata object.
   */
  updateVector(
    collectionId: string,
    vectorId: string,
    data: { document?: string; metadata?: object },
  ): Promise<void>;

  /**
   * Deletes a specific vector by its ID within a collection.
   * @param collectionId - ID of the collection.
   * @param vectorId - Unique identifier of the vector to delete.
   */
  deleteVectorById(collectionId: string, vectorId: string): Promise<void>;

  /**
   * Deletes vectors matching a filter within a collection.
   * @param collectionId - ID of the collection.
   * @param filter - Criteria to match vectors for deletion.
   * @returns Number of vectors deleted.
   */
  deleteVectorsByFilter(collectionId: string, filter: object): Promise<number>;

  /**
   * Retrieves a specific vector by its ID.
   * @param collectionId - ID of the collection.
   * @param vectorId - Unique identifier of the vector.
   * @returns The vector data.
   */
  getVectorById(collectionId: string, vectorId: string): Promise<any>;

  /**
   * Performs a similarity search within a collection.
   * @param collectionId - ID of the collection.
   * @param query - Query string to compare vectors against.
   * @param topK (optional) - Number of top similar results to return.
   * @param filter (optional) - Additional filter criteria.
   * @param include (optional) - Specific fields to include in results.
   * @returns Array of vectors sorted by similarity.
   */
  similaritySearch(
    collectionId: string,
    query: string,
    topK?: number,
    filter?: object,
    include?: string[],
  ): Promise<any[]>;
}
