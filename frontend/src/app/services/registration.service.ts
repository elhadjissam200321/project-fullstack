import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Registration, RegistrationWithProfile } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class RegistrationService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    registerForEvent(eventId: string, userData?: any): Observable<Registration> {
        return this.http.post<{ registration: Registration }>(`${this.apiUrl}/registrations`, {
            eventId,
            firstName: userData?.firstName || 'User',
            lastName: userData?.lastName || 'Guest',
            email: userData?.email || 'guest@example.com',
            ...userData
        }).pipe(
            map(response => response.registration)
        );
    }

    unregisterFromEvent(registrationId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/registrations/${registrationId}`);
    }

    // Adapt to local check if we don't have a specific endpoint for this now
    isUserRegistered(eventId: string): Observable<{ isRegistered: boolean, registration: Registration | null }> {
        return this.http.get<{ isRegistered: boolean, registration: Registration | null }>(`${this.apiUrl}/registrations/check/${eventId}`);
    }

    getEventParticipants(eventId: string): Observable<RegistrationWithProfile[]> {
        return this.http.get<{ registrations: any[] }>(`${this.apiUrl}/registrations/event/${eventId}`).pipe(
            map(response => response.registrations.map(r => ({
                ...r,
                registered_at: r.created_at,
                profile: {
                    full_name: r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim(),
                    email: r.email,
                    avatar_url: r.avatar_url
                }
            })))
        );
    }

    getOrganiserParticipants(): Observable<RegistrationWithProfile[]> {
        return this.http.get<{ registrations: any[] }>(`${this.apiUrl}/registrations/organiser`).pipe(
            map(response => response.registrations.map(r => ({
                ...r,
                registered_at: r.created_at,
                profile: {
                    full_name: r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim(),
                    email: r.email,
                    avatar_url: r.avatar_url
                },
                event_title: r.event_title // Include event title for "All Events" view
            } as any)))
        );
    }

    getUserRegistrations(userId: string): Observable<Registration[]> {
        // Backend currently returns all registrations for an organiser via GET /api/registrations
        // For a participant, we would need a specific endpoint. 
        // Using a shim for now.
        return this.http.get<{ registrations: Registration[] }>(`${this.apiUrl}/registrations`).pipe(
            map(response => response.registrations)
        );
    }
}
