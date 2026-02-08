// Models - Angular interfaces/models

export type AppRole = 'organisateur' | 'participant' | 'super_admin';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: AppRole;
}

export interface Profile {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    school: string | null;
    father_name: string | null;
    mother_name: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserRole {
    id: string;
    user_id: string;
    role: AppRole;
}

export type EventCategory = 'conference' | 'workshop' | 'networking' | 'festival' | 'gala' | 'other';

export interface Event {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    capacity: number;
    category: EventCategory;
    image_url: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface EventWithStats extends Event {
    participant_count: number;
    is_registered?: boolean;
}

export interface Registration {
    id: string;
    user_id: string;
    event_id: string;
    registered_at: string;
}

export interface RegistrationWithProfile extends Registration {
    profile: Profile;
    event_title?: string; // Only present when fetching all organiser participants
}

export interface DashboardStats {
    total_events: number;
    total_participants: number;
    upcoming_events: number;
    participation_trend: { date: string; count: number }[];
}

export interface CreateEventData {
    title: string;
    description: string;
    event_date: string;
    location: string;
    capacity: number;
    category?: EventCategory;
    image_url?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
    id: string;
}

export interface SignUpData {
    email: string;
    password: string;
    fullName: string;
    role: AppRole;
    secretQuestion: string;
    secretAnswer: string;
    school?: string;
    fatherName?: string;
    motherName?: string;
    phone?: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}
