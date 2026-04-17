export interface UserDocumentRequest {
  documentId: number;
  fields: FieldValueRequest[];
}

export interface FieldValueRequest {
  fieldId: number;
  value: string;
}