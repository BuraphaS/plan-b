export type Piece = {
  id: string;
  label: string;
  color?: string;
  border?: string;
  x: number;
  y: number;
  size?: number;
};

export type PlanState = {
  pieces: Piece[];
  paths: Array<{ id: string; points: { x: number; y: number }[]; color: string }>;
};
