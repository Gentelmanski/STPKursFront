export interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  latitude: number;
  longitude: number;
  type: 'concert' | 'exhibition' | 'meetup' | 'workshop' | 'sport' | 'festival' | 'other';
  max_participants?: number;
  price: number;
  is_verified: boolean;
  is_active: boolean;
  creator_id: number;
  created_at: string;
  updated_at: string;
  participants_count: number;
  creator?: {
    id: number;
    username: string;
    email: string;
  };
  tags?: string[];
}

export interface AdminEvent extends Event {
  creator_username: string;
  creator_email: string;
  status: 'pending' | 'verified' | 'rejected';
}