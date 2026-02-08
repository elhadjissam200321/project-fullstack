import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { EventWithStats } from '../../models/models';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Subject, takeUntil, combineLatest, map } from 'rxjs';
import { EventFormDialogComponent } from '../../components/events/event-form-dialog.component';

@Component({
    selector: 'app-manage-events',
    standalone: true,
    imports: [CommonModule, RouterModule, EventFormDialogComponent],
    templateUrl: './manage-events.component.html',
    styleUrls: ['./manage-events.component.css']
})
export class ManageEventsComponent implements OnInit, OnDestroy {
    events: EventWithStats[] = [];
    filteredEvents: EventWithStats[] = [];
    isLoading = true;
    errorMessage: string | null = null;
    userId: string | null = null;
    searchQuery = '';

    // Dialog state
    isCreateOpen = false;
    editEventId: string | undefined = undefined;
    selectedEvent: EventWithStats | undefined = undefined;

    private destroy$ = new Subject<void>();

    constructor(
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
            } else {
                this.isLoading = false;
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

        this.isLoading = true;
        this.eventService.getEventsByOrganiser(this.userId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (events) => {
                this.events = events;
                this.applyFilter();
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Erreur lors du chargement des événements';
                this.isLoading = false;
            }
        });
    }

    applyFilter() {
        if (!this.searchQuery.trim()) {
            this.filteredEvents = this.events;
        } else {
            const query = this.searchQuery.toLowerCase().trim();
            this.filteredEvents = this.events.filter(event =>
                event.title.toLowerCase().includes(query) ||
                event.location.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query)
            );
        }
    }

    formatDate(dateString: string): string {
        return format(new Date(dateString), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
    }

    getDay(dateString: string): string {
        return format(new Date(dateString), 'd');
    }

    getMonth(dateString: string): string {
        return format(new Date(dateString), 'MMM', { locale: fr });
    }

    isPast(dateString: string): boolean {
        return new Date(dateString) < new Date();
    }

    isFull(event: EventWithStats): boolean {
        return event.participant_count >= event.capacity;
    }

    openEdit(id: string) {
        this.editEventId = id;
        this.selectedEvent = this.events.find(e => e.id === id);
        this.isCreateOpen = true;
    }

    openCreate() {
        this.editEventId = undefined;
        this.selectedEvent = undefined;
        this.isCreateOpen = true;
    }

    onDialogClose(open: boolean) {
        this.isCreateOpen = open;
        if (!open) {
            this.editEventId = undefined;
            this.selectedEvent = undefined;
        }
    }

    deleteEvent(eventId: string) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
            return;
        }

        this.eventService.deleteEvent(eventId).subscribe({
            next: () => {
                this.loadEvents();
            },
            error: (error) => {
                this.errorMessage = 'Erreur lors de la suppression';
            }
        });
    }
}
