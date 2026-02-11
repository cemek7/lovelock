export type Difficulty = "easy" | "medium" | "hard";

export type PuzzleStatus =
  | "pending_payment"
  | "active"
  | "opened"
  | "completed"
  | "expired";

export interface DifficultyConfig {
  gridSize: number;
  label: string;
  description: string;
  priceKobo: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    gridSize: 3,
    label: "Easy",
    description: "3×3 grid — 9 pieces",
    priceKobo: 100000,
  },
  medium: {
    gridSize: 4,
    label: "Medium",
    description: "4×4 grid — 16 pieces",
    priceKobo: 200000,
  },
  hard: {
    gridSize: 5,
    label: "Hard",
    description: "5×5 grid — 25 pieces",
    priceKobo: 350000,
  },
};

export interface Puzzle {
  id: string;
  token: string;
  image_url: string;
  difficulty: Difficulty;
  grid_size: number;
  message: string;
  sender_name: string;
  sender_email: string;
  tile_order: number[];
  status: PuzzleStatus;
  payment_reference: string | null;
  payment_amount: number | null;
  paid_at: string | null;
  reveal_at: string | null;
  first_opened_at: string | null;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface PuzzlePublic {
  token: string;
  difficulty: Difficulty;
  grid_size: number;
  message: string;
  sender_name: string;
  tile_order: number[];
  status: PuzzleStatus;
  image_url: string;
  reveal_at: string | null;
  first_opened_at: string | null;
  expires_at: string | null;
  completed_at: string | null;
}

export interface CreatePuzzleRequest {
  image_path: string;
  difficulty: Difficulty;
  message: string;
  sender_name: string;
  sender_email: string;
  reveal_at?: string;
}
