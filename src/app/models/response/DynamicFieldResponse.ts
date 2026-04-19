export interface DynamicFieldResponse {
  fieldId: number;
  keyName: string;
  description: string | null;
  type: 'TEXT' | 'NUMBER' | 'DATE';
  source: 'MANUAL' | 'SYSTEM';
  systemKey: string | null;
}