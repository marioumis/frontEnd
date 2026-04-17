import { DynamicFieldResponse } from '../../models/response/DynamicFieldResponse';

export interface DynamicDocumentResponse {
  docId: number;
  name: string;
  templateFileName: string;
  orderIndex: number | null;
  status: boolean;
  typeDocumentId: number;
  typeDocumentName: string;
  dynamicFields: DynamicFieldResponse[]; // ← uses the import
}