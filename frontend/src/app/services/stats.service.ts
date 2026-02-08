import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStats } from '../models/models';

export interface ParticipationTrend {
    date: string;
    count: number;
}

export interface RecentActivity {
    id: string;
    event_id: string;
    email: string;
    registered_at: string;
    event_title: string;
    full_name?: string;
    avatar_url?: string;
}

@Injectable({
    providedIn: 'root'
})
export class StatsService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<{ stats: any }>(`${this.apiUrl}/stats/dashboard`).pipe(
            map(response => ({
                total_events: response.stats.totalEvents || 0,
                total_participants: response.stats.uniqueParticipants || 0,
                upcoming_events: response.stats.upcomingEvents || 0,
                participation_trend: response.stats.participationTrend || []
            } as DashboardStats))
        );
    }

    getParticipationTrend(): Observable<ParticipationTrend[]> {
        return this.http.get<{ trend: ParticipationTrend[] }>(`${this.apiUrl}/stats/participation-trend`).pipe(
            map(response => response.trend)
        );
    }

    getRecentActivity(): Observable<RecentActivity[]> {
        return this.http.get<{ activity: RecentActivity[] }>(`${this.apiUrl}/stats/recent-activity`).pipe(
            map(response => response.activity)
        );
    }

    getEventStats(eventId: string): Observable<any> {
        return this.http.get<{ stats: any }>(`${this.apiUrl}/stats/events/${eventId}`).pipe(
            map(response => response.stats)
        );
    }
}
