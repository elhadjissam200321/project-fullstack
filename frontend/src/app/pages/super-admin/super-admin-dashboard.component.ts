import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LucideAngularModule, Database, Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-angular';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-super-admin-dashboard',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, MatSnackBarModule],
    template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p class="text-muted-foreground mt-2">Manage global application data and settings.</p>
        </div>
        <div class="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
            <lucide-icon name="alert-triangle" class="h-4 w-4"></lucide-icon>
            <span>Restricted Area</span>
        </div>
      </div>

      <!-- Actions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        <!-- Add Global Data Card -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-blue-100 text-blue-700 rounded-lg">
              <lucide-icon name="database" class="h-6 w-6"></lucide-icon>
            </div>
          </div>
          <h3 class="text-lg font-semibold mb-2">Seed Global Data</h3>
          <p class="text-sm text-muted-foreground mb-6">
            Populate the database with demo events, users, and registrations for ALL organizers. 
            Useful for testing load and multiple user scenarios.
          </p>
          <button (click)="handleGlobalSeed()" [disabled]="isLoading"
            class="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50">
            <lucide-icon *ngIf="!isLoading" name="database" class="h-4 w-4"></lucide-icon>
            <lucide-icon *ngIf="isLoading" name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
            ADD GLOBAL DATA
          </button>
        </div>

        <!-- Remove All Data Card -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-red-100 text-red-700 rounded-lg">
              <lucide-icon name="trash-2" class="h-6 w-6"></lucide-icon>
            </div>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-red-600">Danger Zone: Wipe All Data</h3>
          <p class="text-sm text-muted-foreground mb-6">
            Permanently delete ALL events and registrations from the entire platform. 
            Users and profiles will be preserved, but all activity data will be lost.
          </p>
          <button (click)="handleGlobalClear()" [disabled]="isLoading"
            class="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50">
            <lucide-icon *ngIf="!isLoading" name="trash-2" class="h-4 w-4"></lucide-icon>
            <lucide-icon *ngIf="isLoading" name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
            REMOVE ALL GLOBAL DATA
          </button>
        </div>

      </div>

      <!-- Status Logs (Optional) -->
      <div *ngIf="lastActionStatus" class="mt-8 p-4 rounded-lg border" 
           [ngClass]="lastActionSuccess ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'">
        <div class="flex items-center gap-3">
            <lucide-icon [name]="lastActionSuccess ? 'check-circle-2' : 'alert-triangle'" class="h-5 w-5"></lucide-icon>
            <p class="font-medium">{{ lastActionStatus }}</p>
        </div>
      </div>
    </div>
  `
})
export class SuperAdminDashboardComponent {
    isLoading = false;
    lastActionStatus: string | null = null;
    lastActionSuccess = false;
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

    handleGlobalSeed() {
        this.isLoading = true;
        this.lastActionStatus = null;
        this.http.post<any>(`${this.apiUrl}/seed/global-seed`, {}).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.lastActionSuccess = true;
                this.lastActionStatus = `Success: Added ${res.eventsCount} events globally!`;
                this.snackBar.open(`✅ Global Data Added!`, 'OK', { duration: 3000 });
            },
            error: (err) => {
                this.isLoading = false;
                this.lastActionSuccess = false;
                this.lastActionStatus = `Error: ${err.error?.error || err.message}`;
                this.snackBar.open(`Failed to add data`, 'Close', { duration: 3000 });
            }
        });
    }

    handleGlobalClear() {
        if (!confirm('DANGER: This will delete ALL data (events & registrations) for ALL users. Are you sure?')) return;

        this.isLoading = true;
        this.lastActionStatus = null;
        this.http.delete<any>(`${this.apiUrl}/seed/global-clear`).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.lastActionSuccess = true;
                this.lastActionStatus = `Success: Deleted ${res.deletedEvents} events and ${res.deletedRegistrations} registrations globally.`;
                this.snackBar.open(`✅ All Data Cleared!`, 'OK', { duration: 3000 });
            },
            error: (err) => {
                this.isLoading = false;
                this.lastActionSuccess = false;
                this.lastActionStatus = `Error: ${err.error?.error || err.message}`;
                this.snackBar.open(`Failed to clear data`, 'Close', { duration: 3000 });
            }
        });
    }
}
