import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-seed-users-button',
    standalone: true,
    imports: [CommonModule, MatSnackBarModule, LucideAngularModule],
    template: `
    <button
      *ngIf="isOrganisateur"
      (click)="handleSeedUsers()"
      [disabled]="isSeeding"
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <lucide-icon *ngIf="isSeeding" name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
      <lucide-icon *ngIf="!isSeeding" name="database" class="h-4 w-4"></lucide-icon>
      Créer des utilisateurs de démo
    </button>
  `
})
export class SeedUsersButtonComponent {
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

    handleSeedUsers() {
        this.isSeeding = true;

        this.http.post<any>(`${this.apiUrl}/seed/users`, {}).subscribe({
            next: (response) => {
                this.snackBar.open(
                    `✅ ${response.organisateursCreated} organisateurs et ${response.participantsCreated} participants créés ! Mot de passe: ${response.password}`,
                    'Fermer',
                    { duration: 6000 }
                );
                this.isSeeding = false;
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
