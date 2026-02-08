import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, ParamMap } from '@angular/router';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { EventWithStats, User } from '../../models/models';
import { categoryLabels, categoryColors } from '../../lib/categories';
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Subject, takeUntil, timer } from 'rxjs';

@Component({
    selector: 'app-event-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './event-details.component.html',
    styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit, OnDestroy {
    event: EventWithStats | null = null;
    isLoading = true;
    isRegistered = false;
    isCheckingRegistration = false;
    isRegistering = false;
    errorMessage: string | null = null;
    currentUser: User | null = null;
    userId: string | null = null;
    registrationId: string | null = null;
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private eventService: EventService,
        private registrationService: RegistrationService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        console.log('[EventDetails] Component Init');

        // Failsafe timeout
        timer(12000).pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.isLoading) {
                console.warn('[EventDetails] Failsafe triggered: Loading still true after 12s');
                this.isLoading = false;
                if (!this.event && !this.errorMessage) {
                    this.errorMessage = 'Erreur: Le chargement a expiré. Veuillez vérifier votre connexion.';
                }
                this.cdr.detectChanges();
            }
        });

        this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
            const eventId = params.get('id');
            console.log(`[EventDetails] Route Param ID: ${eventId}`);

            if (!eventId) {
                console.error('[EventDetails] No ID found in route');
                this.router.navigate(['/']);
                return;
            }

            // Initial load
            this.loadEventData(eventId);

            // Auth subscription
            this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
                this.currentUser = user;
                this.userId = user?.id || null;
                console.log(`[EventDetails] Auth State Emitted: user=${this.userId}`);
                if (this.userId) {
                    this.checkRegistration(eventId);
                } else {
                    this.isRegistered = false;
                    this.registrationId = null;
                    this.isCheckingRegistration = false;
                    this.cdr.detectChanges();
                }
            });
        });
    }

    ngOnDestroy() {
        console.log('[EventDetails] Component Destroy');
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadEventData(eventId: string) {
        console.log(`[EventDetails] loadEventData start for ${eventId}`);
        this.isLoading = true;
        this.errorMessage = null;
        this.cdr.detectChanges();

        this.eventService.getEventById(eventId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (event) => {
                console.log(`[EventDetails] Event Data Success for ${eventId}:`, event);
                this.event = event;
                this.isLoading = false;
                if (!event) {
                    this.errorMessage = 'Événement non trouvé ou ID invalide.';
                }
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error(`[EventDetails] Event Data Error for ${eventId}:`, error);
                this.errorMessage = 'Impossible de charger les détails de l\'événement.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    checkRegistration(eventId: string) {
        if (!this.userId) return;

        console.log(`[EventDetails] Checking registration for user ${this.userId} on event ${eventId}`);
        this.isCheckingRegistration = true;
        this.cdr.detectChanges();

        this.registrationService.isUserRegistered(eventId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (result) => {
                console.log(`[EventDetails] Registration check result:`, result);
                this.isRegistered = result.isRegistered;
                this.registrationId = result.registration?.id || null;
                this.isCheckingRegistration = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('[EventDetails] Registration check failed:', error);
                this.isCheckingRegistration = false;
                this.cdr.detectChanges();
            }
        });
    }

    formatDate(dateString: string | undefined): string {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (!isValid(date)) return 'Date invalide';
        return format(date, "EEEE d MMMM yyyy", { locale: fr });
    }

    formatTime(dateString: string | undefined): string {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (!isValid(date)) return '';
        return format(date, "HH:mm", { locale: fr });
    }

    isPastEvent(): boolean {
        if (!this.event) return false;
        return new Date(this.event.event_date) < new Date();
    }

    isFull(): boolean {
        if (!this.event) return false;
        return this.event.participant_count >= this.event.capacity;
    }

    getSpotsLeft(): number {
        if (!this.event) return 0;
        return Math.max(0, this.event.capacity - this.event.participant_count);
    }

    getProgressPercentage(): number {
        if (!this.event || !this.event.capacity) return 0;
        return Math.min((this.event.participant_count / this.event.capacity) * 100, 100);
    }

    getCategoryLabel(category: string): string {
        return categoryLabels[category as keyof typeof categoryLabels] || category;
    }

    getCategoryColor(category: string): string {
        return categoryColors[category as keyof typeof categoryColors] || '';
    }

    handleRegister() {
        if (!this.userId) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: `/events/${this.event?.id}` }
            });
            return;
        }

        if (!this.event) return;

        this.isRegistering = true;
        this.cdr.detectChanges();

        this.registrationService.registerForEvent(this.event.id, {
            firstName: this.currentUser?.fullName.split(' ')[0] || 'User',
            lastName: this.currentUser?.fullName.split(' ').slice(1).join(' ') || ' ',
            email: this.currentUser?.email
        }).subscribe({
            next: (registration) => {
                this.isRegistered = true;
                this.registrationId = registration.id;
                this.isRegistering = false;
                this.loadEventData(this.event!.id);
            },
            error: (error) => {
                this.errorMessage = error.message || 'Erreur lors de l\'inscription';
                this.isRegistering = false;
                this.cdr.detectChanges();
            }
        });
    }

    handleUnregister() {
        if (!this.event || !this.registrationId) return;

        this.isRegistering = true;
        this.cdr.detectChanges();

        this.registrationService.unregisterFromEvent(this.registrationId).subscribe({
            next: () => {
                this.isRegistered = false;
                this.registrationId = null;
                this.isRegistering = false;
                this.loadEventData(this.event!.id);
                this.checkRegistration(this.event!.id);
            },
            error: (error) => {
                this.errorMessage = error.message || 'Erreur lors de la désinscription';
                this.isRegistering = false;
                this.cdr.detectChanges();
            }
        });
    }

    goBack() {
        this.router.navigate(['/']);
    }
}
