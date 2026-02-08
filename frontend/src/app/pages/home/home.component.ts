import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { EventWithStats } from '../../models/models';
import { EventCardComponent } from '../../components/event-card.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, EventCardComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
    upcomingEvents: EventWithStats[] = [];
    filteredEvents: EventWithStats[] = [];
    isLoading = true;
    error: string | null = null;
    searchQuery = '';
    selectedCategory = 'all';
    private destroy$ = new Subject<void>();

    displayedEvents: EventWithStats[] = [];
    itemsToShow = 9;

    constructor(
        private eventService: EventService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadEvents();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadEvents() {
        this.isLoading = true;
        this.error = null;
        this.cdr.detectChanges();

        this.eventService.getUpcomingEvents().pipe(takeUntil(this.destroy$)).subscribe({
            next: (events) => {
                // Defer to next tick to avoid NG0100
                setTimeout(() => {
                    this.upcomingEvents = events;
                    this.filterEvents();
                    this.isLoading = false;
                    this.cdr.detectChanges();
                });
            },
            error: (err) => {
                setTimeout(() => {
                    this.error = 'Failed to load events. Please try again.';
                    this.isLoading = false;
                    this.cdr.detectChanges();
                    console.error('Error loading events:', err);
                });
            }
        });
    }

    onSearchChange() {
        this.filterEvents();
    }

    filterEvents() {
        let filtered = this.upcomingEvents;

        // Filter by category
        if (this.selectedCategory !== 'all') {
            filtered = filtered.filter(event => event.category === this.selectedCategory);
        }

        // Filter by search query
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(query) ||
                event.location.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query)
            );
        }

        this.filteredEvents = filtered;
        // Reset displayed items when filter changes, optional: or keep current count
        // this.itemsToShow = 9; 
        this.updateDisplayedEvents();
    }

    updateDisplayedEvents() {
        this.displayedEvents = this.filteredEvents.slice(0, this.itemsToShow);
        this.cdr.detectChanges();
    }

    loadMore() {
        this.itemsToShow += 9;
        this.updateDisplayedEvents();
    }

    getTotalParticipants(): number {
        return this.upcomingEvents.reduce((sum, event) => sum + event.participant_count, 0);
    }
}
