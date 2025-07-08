export interface User {
  id: string;
  student_id: string;
  name: string;
  email: string;
  role?: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  order_index: number;
  vote_count: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  creator_id: string;
  is_anonymous: boolean;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  created_at: string;
  options?: PollOption[];
}
