export interface DynamicDocumentRequest {
  name: string;
  typeDocumentId: number;
  orderIndex?: number | null;
  status?: boolean;
  autoScan: boolean; 
}