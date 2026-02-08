import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-clear-demo-data-button',
    standalone: true,
    imports: [CommonModule, MatSnackBarModule, LucideAngularModule],
    template: `
    <button
      *ngIf="isOrganisateur"
      (click)="handleClearData()"
      [disabled]="isClearing"
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-destructive/20 text-destructive rounded-lg hover:bg-destructive hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-destructive/10"
    >
      <lucide-icon *ngIf="isClearing" name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
      <lucide-icon *ngIf="!isClearing" name="trash-2" class="h-4 w-4"></lucide-icon>
      REMOVE DATA
    </button>
  `
})
export class ClearDemoDataButtonComponent {
    isClearing = false;
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

    handleClearData() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer toutes vos données de démo ? Cette action est irréversible.')) {
            return;
        }

        this.isClearing = true;

        this.http.delete<any>(`${this.apiUrl}/seed/clear`).subscribe({
            next: (response) => {
                const regs = response.deletedRegistrations ?? 0;
                this.snackBar.open(
                    `✅ ${response.deletedEvents} événements et ${regs} inscriptions supprimés.`,
                    'Fermer',
                    { duration: 4000 }
                );

                // Reload page to reflect changes
                setTimeout(() => window.location.reload(), 1000);
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
                this.isClearing = false;
            }
        });
    }
}
