import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event, EventWithStats, CreateEventData, UpdateEventData } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAllEvents(): Observable<EventWithStats[]> {
        return this.http.get<{ events: any[] }>(`${this.apiUrl}/events`).pipe(
            map(response => response.events.map(e => this.mapEventResponse(e)))
        );
    }

    getUpcomingEvents(): Observable<EventWithStats[]> {
        return this.http.get<{ events: any[] }>(`${this.apiUrl}/events?upcoming=true`).pipe(
            map(response => response.events.map(e => this.mapEventResponse(e)))
        );
    }

    getEventById(id: string): Observable<EventWithStats | null> {
        return this.http.get<{ event: any }>(`${this.apiUrl}/events/${id}`).pipe(
            map(response => this.mapEventResponse(response.event))
        );
    }

    createEvent(data: CreateEventData): Observable<Event> {
        return this.http.post<{ event: Event }>(`${this.apiUrl}/events`, data).pipe(
            timeout(30000),
            map(response => response.event)
        );
    }

    updateEvent({ id, ...data }: UpdateEventData): Observable<Event> {
        return this.http.put<{ event: Event }>(`${this.apiUrl}/events/${id}`, data).pipe(
            timeout(30000),
            map(response => response.event)
        );
    }

    deleteEvent(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/events/${id}`).pipe(
            timeout(30000)
        );
    }

    // Accepts optional userId for compatibility, but uses the 'my-events' endpoint which uses the token
    getEventsByOrganiser(userId?: string): Observable<EventWithStats[]> {
        return this.http.get<{ events: any[] }>(`${this.apiUrl}/events/organiser/my-events`).pipe(
            map(response => response.events.map(e => this.mapEventResponse(e)))
        );
    }

    private mapEventResponse(event: any): EventWithStats {
        if (!event) return null as any;
        return {
            ...event,
            participant_count: event.registrationCount !== undefined ? event.registrationCount : (event.participant_count || 0)
        };
    }
}
