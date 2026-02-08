import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
    profileForm: FormGroup;
    isLoading = true;
    isUpdating = false;
    errorMessage: string | null = null;
    currentUser: any = null;
    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) {
        this.profileForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
        });
    }

    ngOnInit() {
        this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
            if (user) {
                // Defer state changes to the next macrotask to avoid NG0100 error
                setTimeout(() => {
                    this.currentUser = user;
                    this.profileForm.patchValue({
                        fullName: user.fullName
                    });
                    this.isLoading = false;
                    this.cdr.detectChanges();
                });
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get fullName() {
        return this.profileForm.get('fullName');
    }

    getInitials(name: string): string {
        if (!name) return '??';
        return name
            .split(' ')
            .filter(n => n.length > 0)
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    onSubmit() {
        if (this.profileForm.invalid) {
            this.fullName?.markAsTouched();
            return;
        }

        this.isUpdating = true;
        this.errorMessage = null;

        const fullName = this.profileForm.value.fullName.trim();

        this.authService.updateProfile(fullName).subscribe({
            next: (user) => {
                this.isUpdating = false;
                this.snackBar.open('✅ Profil mis à jour avec succès!', 'Fermer', {
                    duration: 3000
                });
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.isUpdating = false;
                const errorMsg = error.error?.error || 'Erreur lors de la mise à jour du profil';
                this.errorMessage = errorMsg;
                this.snackBar.open(`❌ ${errorMsg}`, 'Fermer', {
                    duration: 5000,
                    panelClass: ['bg-destructive', 'text-destructive-foreground']
                });
                this.cdr.detectChanges();
            }
        });
    }
}
