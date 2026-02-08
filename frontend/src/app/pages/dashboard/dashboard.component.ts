import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsService, RecentActivity } from '../../services/stats.service';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { DashboardStats, EventWithStats } from '../../models/models';
import { Subject, takeUntil, map, forkJoin } from 'rxjs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StatCardComponent } from '../../components/dashboard/stat-card.component';
import { ParticipationChartComponent } from '../../components/dashboard/participation-chart.component';
import { LucideAngularModule } from 'lucide-angular';
import { SeedDataButtonComponent } from '../../components/dashboard/seed-data-button.component';
import { ClearDemoDataButtonComponent } from '../../components/dashboard/clear-demo-data-button.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        StatCardComponent,
        ParticipationChartComponent,
        LucideAngularModule,
        SeedDataButtonComponent,
        ClearDemoDataButtonComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
    stats: DashboardStats | null = null;
    upcomingEvents: EventWithStats[] = [];
    recentActivity: RecentActivity[] = [];
    isLoading = true;
    isLoadingEvents = true;
    errorMessage: string | null = null;
    private destroy$ = new Subject<void>();

    icons = {
        calendar: 'calendar',
        users: 'users',
        calendarCheck: 'calendar-check',
        trendingUp: 'trending-up',
        clock: 'clock',
        chevronRight: 'chevron-right'
    };

    constructor(
        private statsService: StatsService,
        private eventService: EventService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadStats();

        this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
            if (user) {
                this.loadUpcomingEvents(user.id);
            } else {
                this.isLoadingEvents = false;
                this.cdr.detectChanges();
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadStats() {
        this.isLoading = true;
        this.errorMessage = null;

        forkJoin({
            stats: this.statsService.getDashboardStats(),
            activity: this.statsService.getRecentActivity()
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (results) => {
                this.stats = results.stats;
                this.recentActivity = results.activity;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                const msg = err?.error?.error || err?.message || 'Erreur lors du chargement des statistiques';
                this.errorMessage = typeof msg === 'string' ? msg : 'Erreur lors du chargement des statistiques';
                if (err?.status === 401) {
                    this.authService.signOut().subscribe();
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadUpcomingEvents(userId: string) {
        this.isLoadingEvents = true;
        this.eventService.getEventsByOrganiser(userId).pipe(
            takeUntil(this.destroy$),
            map(events => events
                .filter(e => new Date(e.event_date) > new Date())
                .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                .slice(0, 8)
            )
        ).subscribe({
            next: (events) => {
                this.upcomingEvents = events;
                this.isLoadingEvents = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoadingEvents = false;
                this.cdr.detectChanges();
            }
        });
    }

    formatDate(dateString: string): string {
        try {
            return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
        } catch {
            return dateString;
        }
    }

    formatDay(dateString: string): string {
        try {
            return format(new Date(dateString), 'd', { locale: fr });
        } catch {
            return '';
        }
    }

    formatMonthShort(dateString: string): string {
        try {
            return format(new Date(dateString), 'MMM', { locale: fr }).replace('.', '');
        } catch {
            return '';
        }
    }

    getTrendCount(): number {
        return this.stats?.participation_trend?.reduce((sum, d) => sum + d.count, 0) || 0;
    }

    getInitials(name?: string): string {
        if (!name) return 'U';
        return name
            .split(' ')
            .filter(n => n.length > 0)
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    isAuthError(): boolean {
        if (!this.errorMessage) return false;
        const m = this.errorMessage.toLowerCase();
        return m.includes('token') || m.includes('invalid') || m.includes('expired') || m.includes('401') || m.includes('unauthenticated');
    }
}
