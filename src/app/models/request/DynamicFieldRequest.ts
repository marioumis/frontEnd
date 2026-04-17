export interface DynamicFieldRequest {
  docId?: number;
  keyName: string;
  type: 'TEXT' | 'NUMBER' | 'DATE';
  description?: string | null;
}