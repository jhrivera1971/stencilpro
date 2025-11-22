
export interface StencilWork {
  id: string;
  originalImage: string;
  stencilImage: string;
  createdAt: number;
  style?: string;
}

export enum ViewMode {
  SPLIT = 'SPLIT',
  OVERLAY = 'OVERLAY',
  EDIT = 'EDIT'
}
