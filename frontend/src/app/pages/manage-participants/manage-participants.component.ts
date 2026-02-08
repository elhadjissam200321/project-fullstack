import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RegistrationService } from '../../services/registration.service';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { RegistrationWithProfile, EventWithStats } from '../../models/models';
import { Subject, takeUntil } from 'rxjs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
    selector: 'app-manage-participants',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './manage-participants.component.html',
    styleUrls: ['./manage-participants.component.css']
})
export class ManageParticipantsComponent implements OnInit, OnDestroy {
    events: EventWithStats[] = [];
    participants: RegistrationWithProfile[] = [];
    filteredParticipants: RegistrationWithProfile[] = [];

    isLoadingEvents = true;
    isLoadingParticipants = false;

    selectedEventId: string = 'all';
    searchQuery: string = '';

    userId: string | null = null;
    private destroy$ = new Subject<void>();

    constructor(
        private registrationService: RegistrationService,
        private eventService: EventService,
        private authService: AuthService,
        private searchService: SearchService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
            this.userId = user?.id || null;
            if (this.userId) {
                this.loadEvents();
                // Default to loading all participants
                this.onEventChange();
            } else {
                this.isLoadingEvents = false;
            }
        });

        this.searchService.searchQuery$.pipe(takeUntil(this.destroy$)).subscribe(query => {
            this.searchQuery = query;
            this.applyFilter();
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadEvents() {
        if (!this.userId) return;
        this.isLoadingEvents = true;
        this.eventService.getEventsByOrganiser(this.userId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (events) => {
                this.events = events;
                this.isLoadingEvents = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoadingEvents = false;
                this.cdr.detectChanges();
            }
        });
    }

    onEventChange() {
        this.isLoadingParticipants = true;

        const participants$ = this.selectedEventId === 'all'
            ? this.registrationService.getOrganiserParticipants()
            : this.registrationService.getEventParticipants(this.selectedEventId);

        participants$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (participants) => {
                this.participants = participants;
                this.applyFilter();
                this.isLoadingParticipants = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoadingParticipants = false;
                this.cdr.detectChanges();
            }
        });
    }

    applyFilter() {
        const query = this.searchQuery.toLowerCase().trim();
        if (!query) {
            this.filteredParticipants = this.participants;
        } else {
            this.filteredParticipants = this.participants.filter(p =>
                p.profile.full_name.toLowerCase().includes(query) ||
                p.profile.email.toLowerCase().includes(query)
            );
        }
        this.cdr.detectChanges();
    }

    exportCSV() {
        if (this.filteredParticipants.length === 0) return;

        const headers = ['Nom', 'Email', 'Date d\'inscription', 'Événement'];
        const rows = this.filteredParticipants.map(p => [
            p.profile.full_name,
            p.profile.email,
            format(new Date(p.registered_at), 'yyyy-MM-dd HH:mm'),
            this.getSelectedEvent()?.title || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `participants-${this.getSelectedEvent()?.title || 'export'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    formatDate(dateString: string): string {
        return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
    }

    getSelectedEvent() {
        return this.events.find(e => e.id === this.selectedEventId);
    }
}
