import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsService } from '../../services/stats.service';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { DashboardStats, EventWithStats } from '../../models/models';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { StatCardComponent } from '../../components/dashboard/stat-card.component';
import { ParticipationChartComponent } from '../../components/dashboard/participation-chart.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-statistics',
    standalone: true,
    imports: [CommonModule, RouterModule, StatCardComponent, ParticipationChartComponent, LucideAngularModule],
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit, OnDestroy {
    stats: DashboardStats | null = null;
    events: EventWithStats[] = [];
    isLoading = true;
    errorMessage: string | null = null;
    userId: string | null = null;

    totalCapacity = 0;
    totalRegistrations = 0;
    utilizationRate = 0;

    capacityData: any[] = [];
    pieData: any[] = [];

    icons = {
        calendar: 'calendar',
        users: 'users',
        utilizationRate: 'bar-chart-3',
        trendingUp: 'trending-up'
    };

    private destroy$ = new Subject<void>();

    constructor(
        private statsService: StatsService,
        private eventService: EventService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
            this.userId = user?.id || null;
            if (this.userId) {
                this.loadData();
            } else {
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadData() {
        this.isLoading = true;
        if (!this.userId) return;

        forkJoin({
            stats: this.statsService.getDashboardStats(),
            events: this.eventService.getEventsByOrganiser(this.userId)
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (results) => {
                this.stats = results.stats;
                this.events = results.events;
                this.calculateMetrics();
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.errorMessage = 'Erreur lors du chargement des statistiques';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private calculateMetrics() {
        this.totalCapacity = this.events.reduce((sum, e) => sum + e.capacity, 0);
        this.totalRegistrations = this.events.reduce((sum, e) => sum + (e.participant_count || 0), 0);
        this.utilizationRate = this.totalCapacity > 0 ? Math.round((this.totalRegistrations / this.totalCapacity) * 100) : 0;

        this.capacityData = this.events.map(event => ({
            name: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
            participants: event.participant_count || 0,
            capacity: event.capacity,
            percent: event.capacity > 0 ? ((event.participant_count || 0) / event.capacity) * 100 : 0
        }));

        this.pieData = [
            { name: 'Rempli', value: this.totalRegistrations, color: 'bg-accent' },
            { name: 'Disponible', value: Math.max(0, this.totalCapacity - this.totalRegistrations), color: 'bg-muted' }
        ];
    }

    getTrendSum(): number {
        return this.stats?.participation_trend?.reduce((sum, d) => sum + d.count, 0) || 0;
    }
}
