import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { Event, EventWithStats, EventCategory } from '../../models/models';
import { format } from 'date-fns';

@Component({
  selector: 'app-event-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" (click)="close()"></div>
      
      <!-- Modal -->
      <div class="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-lg flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="p-6 border-b border-border">
          <h2 class="text-xl font-semibold">{{ isEditing ? 'Modifier l\\'événement' : 'Créer un événement' }}</h2>
          <p class="text-sm text-muted-foreground mt-1">
            {{ isEditing ? 'Modifiez les informations de votre événement' : 'Remplissez les informations pour créer un nouvel événement' }}
          </p>
        </div>

        <!-- Form Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div *ngIf="isLoading" class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>

          <form *ngIf="!isLoading" [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Title -->
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Titre</label>
              <input type="text" formControlName="title" placeholder="Nom de l'événement"
                     class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <p *ngIf="eventForm.get('title')?.touched && eventForm.get('title')?.errors?.['required']" class="text-xs text-destructive">Le titre est requis</p>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Description</label>
              <textarea formControlName="description" placeholder="Décrivez votre événement..." rows="4"
                        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"></textarea>
              <p *ngIf="eventForm.get('description')?.touched && eventForm.get('description')?.errors?.['required']" class="text-xs text-destructive">La description est requise</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Date -->
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Date</label>
                <input type="date" formControlName="event_date"
                       class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              </div>

              <!-- Time -->
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Heure</label>
                <input type="time" formControlName="event_time"
                       class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Location -->
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Lieu</label>
                <input type="text" formControlName="location" placeholder="Adresse ou lieu"
                       class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              </div>

              <!-- Category -->
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Catégorie</label>
                <select formControlName="category"
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option *ngFor="let opt of categoryOptions" [value]="opt.value">{{ opt.label }}</option>
                </select>
              </div>
            </div>

            <!-- Capacity -->
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Capacité</label>
              <input type="number" formControlName="capacity" min="1"
                     class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            </div>

            <!-- Image URL -->
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Image (URL optionnelle)</label>
              <input type="text" formControlName="image_url" placeholder="https://example.com/image.jpg"
                     class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-border flex flex-col gap-3 bg-muted/50">
          <div *ngIf="errorMessage" class="text-xs text-destructive font-medium mb-2">{{ errorMessage }}</div>
          <div class="flex justify-end gap-3">
            <button type="button" (click)="close()"
                    class="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-muted rounded-md transition-colors">
              Annuler
            </button>
            <button type="button" (click)="onSubmit()" [disabled]="eventForm.invalid || isSubmitting"
                    class="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2">
              <div *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ isEditing ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class EventFormDialogComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() eventId?: string;
  @Input() event: Event | null | undefined = null;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  eventForm: FormGroup;
  isEditing = false;
  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  categoryOptions: { value: EventCategory, label: string }[] = [
    { value: 'conference', label: 'Conférence' },
    { value: 'workshop', label: 'Atelier' },
    { value: 'networking', label: 'Networking' },
    { value: 'festival', label: 'Festival' },
    { value: 'gala', label: 'Gala' },
    { value: 'other', label: 'Autre' },
  ];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      event_date: [format(new Date(), 'yyyy-MM-dd'), Validators.required],
      event_time: ['18:00', Validators.required],
      location: ['', Validators.required],
      capacity: [50, [Validators.required, Validators.min(1)]],
      category: ['other', Validators.required],
      image_url: ['']
    });
  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open) {
      // Determine if we are editing
      this.isEditing = !!this.eventId || !!this.event;

      if (this.event) {
        // Optimization: Use provided event object directly without fetch
        this.patchForm(this.event);
        this.isLoading = false;
      } else if (this.isEditing && this.eventId) {
        // Fallback: Fetch if only ID provided
        this.loadEvent();
      } else {
        // Creating new event
        this.resetForm();
      }
    }
  }

  resetForm() {
    this.eventForm.reset({
      title: '',
      description: '',
      event_date: format(new Date(), 'yyyy-MM-dd'),
      event_time: '18:00',
      location: '',
      capacity: 50,
      category: 'other',
      image_url: ''
    });
  }

  patchForm(event: Event) {
    const eventDate = new Date(event.event_date);
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      event_date: format(eventDate, 'yyyy-MM-dd'),
      event_time: format(eventDate, 'HH:mm'),
      location: event.location,
      capacity: event.capacity,
      category: event.category || 'other',
      image_url: event.image_url || ''
    });
  }

  loadEvent() {
    if (!this.eventId) return;
    this.isLoading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        if (event) {
          this.patchForm(event);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  close() {
    this.open = false;
    this.openChange.emit(false);
  }

  onSubmit() {
    if (this.eventForm.invalid) return;

    this.isSubmitting = true;
    const formValue = this.eventForm.value;

    // Combine date and time strings into a single date object
    const [year, month, day] = formValue.event_date.split('-').map(Number);
    const [hours, minutes] = formValue.event_time.split(':').map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);

    const eventData = {
      title: formValue.title,
      description: formValue.description,
      event_date: eventDate.toISOString(),
      location: formValue.location,
      capacity: formValue.capacity,
      category: formValue.category,
      image_url: formValue.image_url || undefined
    };

    const request$ = (this.isEditing && this.eventId)
      ? this.eventService.updateEvent({ id: this.eventId, ...eventData })
      : this.eventService.createEvent(eventData);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.saved.emit();
        this.close();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.error || 'Une erreur est survenue';
      }
    });
  }
}
