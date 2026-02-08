import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../models/models';
import { LogoComponent } from './common/logo.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent, LucideAngularModule],
  template: `
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-16 items-center justify-between px-4 mx-auto">
        <!-- Logo -->
        <div class="flex-1 flex justify-center md:justify-start md:flex-none">
          <app-logo></app-logo>
        </div>

        <!-- Desktop navigation -->
        <nav class="hidden md:flex items-center gap-6 mx-6">
          <a routerLink="/" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Événements
          </a>
          <a *ngIf="isOrganisateur" routerLink="/dashboard" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </a>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center gap-4">
          <ng-container *ngIf="isAuthenticated; else loginButtons">
            <!-- Simple User Menu for Parity -->
            <div class="relative group">
              <button class="relative h-9 w-9 rounded-full overflow-hidden border border-border bg-accent text-accent-foreground flex items-center justify-center font-bold">
                <span>{{ getInitials() }}</span>
              </button>
              
              <!-- Dropdown hover menu -->
              <div class="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div class="w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden py-1">
                  <div class="px-4 py-2 border-b border-border">
                    <p class="text-sm font-medium truncate">{{ currentUser?.fullName }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ currentUser?.email }}</p>
                  </div>
                  <a *ngIf="isOrganisateur" routerLink="/dashboard" class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors font-medium">
                    <lucide-icon name="layout-dashboard" class="h-4 w-4 text-muted-foreground"></lucide-icon>
                    Dashboard
                  </a>
                  <a routerLink="/profile" class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors font-medium">
                    <lucide-icon name="user" class="h-4 w-4 text-muted-foreground"></lucide-icon>
                    Mon profil
                  </a>
                  <hr class="border-border my-1">
                  <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left font-medium">
                    <lucide-icon name="log-out" class="h-4 w-4"></lucide-icon>
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </ng-container>

          <ng-template #loginButtons>
            <div class="flex items-center gap-2">
              <a routerLink="/login" class="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">Connexion</a>
              <a routerLink="/register" class="btn-accent px-4 py-2 text-sm rounded-lg font-medium transition-colors">S'inscrire</a>
            </div>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isOrganisateur = false;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(auth => {
      this.isAuthenticated = auth;
      this.cdr.detectChanges();
    });

    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
      this.isOrganisateur = user?.role === 'organisateur';
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getInitials(): string {
    if (!this.currentUser?.fullName) return 'U';
    return this.currentUser.fullName
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
