import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { LogoComponent } from '../../components/common/logo.component';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import {
  LucideAngularModule,
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Database,
  Bell,
  Search,
  User,
  ChevronDown,
  Globe,
  ShieldAlert,
  Loader2,
  Trash2
} from 'lucide-angular';
import { User as AppUser } from '../../models/models';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LogoComponent,
    LucideAngularModule,
    FormsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="h-full flex w-full bg-background font-sans text-foreground antialiased">
        <!-- Mobile sidebar backdrop -->
        <div *ngIf="isSidebarOpen" 
             class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
             (click)="isSidebarOpen = false">
        </div>

        <!-- Sidebar -->
        <aside class="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 overflow-y-auto"
               [ngClass]="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'">
            <div class="flex h-full flex-col">
                <!-- Sidebar header -->
                <div class="flex h-16 items-center justify-between border-b border-border px-4">
                    <app-logo className="text-foreground"></app-logo>
                    <button class="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
                            (click)="isSidebarOpen = false">
                        <lucide-icon name="x" class="h-5 w-5"></lucide-icon>
                    </button>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <a *ngFor="let item of primaryNav" 
                       [routerLink]="item.to" 
                       [routerLinkActive]="['bg-accent/10', 'text-accent', 'font-bold']"
                       [routerLinkActiveOptions]="{ exact: item.exact }"
                       class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all group">
                        <lucide-icon [name]="item.icon" class="h-5 w-5"></lucide-icon>
                        {{ item.label }}
                    </a>

                    <!-- Super Admin Section -->
                    <div *ngIf="isSuperAdmin" class="mt-8 pt-4 border-t border-border">
                        <p class="px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                            Super Admin
                        </p>
                        <a routerLink="/dashboard/admin" 
                           routerLinkActive="bg-red-50 text-red-600"
                           class="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-all group">
                            <lucide-icon name="shield-alert" class="h-5 w-5"></lucide-icon>
                            Admin Dashboard
                        </a>

                        <div class="px-3 space-y-2">
                             <button (click)="handleGlobalSeed()" [disabled]="isGlobalLoading"
                                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50">
                                <lucide-icon *ngIf="!isGlobalLoading" name="database" class="h-4 w-4"></lucide-icon>
                                <lucide-icon *ngIf="isGlobalLoading" name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
                                ADD GLOBAL DATA
                            </button>
                            <button (click)="handleGlobalClear()" [disabled]="isGlobalLoading"
                                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50">
                                <lucide-icon *ngIf="!isGlobalLoading" name="trash-2" class="h-4 w-4"></lucide-icon>
                                <lucide-icon *ngIf="isGlobalLoading" name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
                                REMOVE ALL DATA
                            </button>
                        </div>
                    </div>
                </nav>

                <!-- Back to site link -->
                <div class="border-t border-border p-4">
                    <a routerLink="/" 
                       class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
                        <lucide-icon name="globe" class="h-5 w-5"></lucide-icon>
                        Retour au site
                    </a>
                </div>

                <!-- User section -->
                <div class="border-t border-border p-4">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="h-10 w-10 rounded-full bg-accent flex items-center justify-center overflow-hidden border border-border">
                            <img *ngIf="profile?.avatar_url" [src]="profile.avatar_url" class="h-full w-full object-cover">
                            <span *ngIf="!profile?.avatar_url" class="text-xs font-bold text-accent-foreground">{{ getInitials() }}</span>
                        </div>
                        <div class="flex-1 truncate">
                            <p class="text-sm font-medium text-foreground truncate">
                                {{ profile?.full_name || 'Utilisateur' }}
                            </p>
                            <p class="text-xs text-muted-foreground truncate">
                                {{ profile?.role || 'No Role' }}
                            </p>
                            <p *ngIf="debugInfo" class="text-[10px] text-red-500 font-mono">
                                {{ debugInfo }}
                            </p>
                        </div>
                    </div>
                    <button (click)="logout()" 
                            class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all">
                        <lucide-icon name="log-out" class="h-4 w-4"></lucide-icon>
                        Déconnexion
                    </button>
                </div>
            </div>
        </aside>

        <!-- Main content -->
        <div class="flex-1 flex flex-col min-w-0 min-h-0">
            <!-- Mobile header -->
            <header class="shrink-0 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
                <button class="p-2 hover:bg-accent rounded-lg transition-colors"
                        (click)="isSidebarOpen = true">
                    <lucide-icon name="menu" class="h-5 w-5"></lucide-icon>
                </button>
                <app-logo></app-logo>
            </header>

            <!-- Page content -->
            <main class="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8">
                <router-outlet></router-outlet>
            </main>
        </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }
  `]
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  profile: any = null;
  isSidebarOpen = false;
  searchQuery = '';
  isSuperAdmin = false;
  isGlobalLoading = false;
  debugInfo = '';
  private apiUrl = environment.apiUrl;
  private destroy$ = new Subject<void>();

  primaryNav = [
    { label: 'Statistiques', icon: 'bar-chart-3', to: '/dashboard/statistics', exact: false },
    { label: 'Événements', icon: 'calendar', to: '/dashboard/events', exact: false },
    { label: 'Participants', icon: 'users', to: '/dashboard/participants', exact: false },
  ];

  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    console.log('Dashboard Layout Init');
    this.authService.currentProfile$.pipe(takeUntil(this.destroy$)).subscribe((profile: any) => {
      this.profile = profile;
    });

    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: any) => {
      if (user) {
        console.log('Current User Role:', user.role);
        this.isSuperAdmin = user.role === 'super_admin';
        this.debugInfo = `Role: ${user.role}`;
      } else {
        this.debugInfo = 'No User';
      }
    });

    this.searchService.searchQuery$.pipe(takeUntil(this.destroy$)).subscribe(query => {
      this.searchQuery = query;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isSidebarOpen = false;
    });
  }

  handleGlobalSeed() {
    this.isGlobalLoading = true;
    this.http.post<any>(`${this.apiUrl}/seed/global-seed`, {}).subscribe({
      next: (res) => {
        this.snackBar.open(`✅ Global Data Added: ${res.eventsCount} events!`, 'OK', { duration: 4000 });
        this.isGlobalLoading = false;
        // Reload to show changes
        setTimeout(() => window.location.reload(), 1500);
      },
      error: (err) => {
        this.snackBar.open(`Error: ${err.error?.error || err.message}`, 'Close', { duration: 5000 });
        this.isGlobalLoading = false;
      }
    });
  }

  handleGlobalClear() {
    if (!confirm('DANGER: This will delete ALL data (events & registrations) for ALL users. Are you sure?')) return;

    this.isGlobalLoading = true;
    this.http.delete<any>(`${this.apiUrl}/seed/global-clear`).subscribe({
      next: (res) => {
        this.snackBar.open(`✅ ALL Data Removed: ${res.deletedEvents} events deleted.`, 'OK', { duration: 4000 });
        this.isGlobalLoading = false;
        setTimeout(() => window.location.reload(), 1500);
      },
      error: (err) => {
        this.snackBar.open(`Error: ${err.error?.error || err.message}`, 'Close', { duration: 5000 });
        this.isGlobalLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange() {
    this.searchService.setSearchQuery(this.searchQuery);
  }

  getInitials(): string {
    if (!this.profile?.full_name) return 'U';
    return this.profile.full_name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  logout() {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
