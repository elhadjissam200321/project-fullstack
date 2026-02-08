import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';
import { switchMap } from 'rxjs';

@Component({
    selector: 'app-seed-data-button',
    standalone: true,
    imports: [CommonModule, MatSnackBarModule, LucideAngularModule],
    template: `
    <button
      *ngIf="isOrganisateur"
      (click)="handleSeedData()"
      [disabled]="isSeeding"
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
    >
      <lucide-icon *ngIf="isSeeding" name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
      <lucide-icon *ngIf="!isSeeding" name="database" class="h-4 w-4"></lucide-icon>
      ADD DATA
    </button>
  `
})
export class SeedDataButtonComponent {
    isSeeding = false;
    isOrganisateur = false;
    private apiUrl = environment.apiUrl;

    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {
        this.authService.currentUser$.subscribe(user => {
            this.isOrganisateur = user?.role === 'organisateur';
        });
    }

    handleSeedData() {
        this.isSeeding = true;

        // First seed users, then seed events
        this.http.post<any>(`${this.apiUrl}/seed/users`, {}).pipe(
            switchMap(() => this.http.post<any>(`${this.apiUrl}/seed/events`, {}))
        ).subscribe({
            next: (response) => {
                this.snackBar.open(
                    `✅ Données de démo créées : ${response.eventsCount} événements et ${response.registrationsCount} inscriptions !`,
                    'Fermer',
                    { duration: 4000 }
                );

                // Reload page to show new data (delay so backend can commit)
                setTimeout(() => window.location.reload(), 1800);
            },
            error: (error) => {
                this.snackBar.open(
                    `Erreur: ${error.error?.error || error.message}`,
                    'Fermer',
                    {
                        duration: 5000,
                        panelClass: ['bg-destructive', 'text-destructive-foreground']
                    }
                );
                this.isSeeding = false;
            }
        });
    }
}
