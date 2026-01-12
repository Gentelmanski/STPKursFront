// models/user-event.ts
export interface UserEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  type: 'concert' | 'exhibition' | 'meetup' | 'workshop' | 'sport' | 'festival' | 'other';
  max_participants?: number;
  price: number;
  is_verified: boolean;
  is_active: boolean;
  creator_id: number;
  created_at: string;
  updated_at: string;
  participants_count: number;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  status?: 'upcoming' | 'ongoing' | 'past';
  participation_status?: 'going' | 'maybe' | 'declined';
}