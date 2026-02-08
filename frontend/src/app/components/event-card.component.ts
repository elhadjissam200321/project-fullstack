import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventWithStats } from '../models/models';
import { categoryLabels, categoryColors } from '../lib/categories';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a [routerLink]="['/events', event.id]" class="block">
      <div class="card-hover group h-full overflow-hidden bg-card rounded-lg border shadow-sm">
        <!-- Image -->
        <div class="relative h-48 overflow-hidden bg-muted">
          <div 
            class="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            [style.background-image]="event.image_url ? 'url(' + event.image_url + ')' : 'none'"
            *ngIf="event.image_url">
          </div>
          <div *ngIf="!event.image_url" class="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center mb-2">
                <svg class="h-8 w-8 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-xs text-muted-foreground/50 font-medium">Événement</span>
            </div>
          </div>
          
          <!-- Badges -->
          <div class="absolute right-3 top-3 flex gap-2">
            <span *ngIf="isPast" class="px-2 py-1 text-xs rounded-md bg-muted/90 backdrop-blur-sm">
              Terminé
            </span>
            <span *ngIf="!isPast && isFull" class="px-2 py-1 text-xs rounded-md bg-destructive text-destructive-foreground backdrop-blur-sm">
              Complet
            </span>
          </div>
        </div>

        <!-- Header -->
        <div class="p-4 pb-2">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time [attr.datetime]="event.event_date">
                {{ formatDate(event.event_date) }}
              </time>
            </div>
            <span [class]="'px-2 py-1 text-xs rounded-md border font-medium ' + getCategoryColor(event.category)">
              {{ getCategoryLabel(event.category) }}
            </span>
          </div>
          <h3 class="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-accent transition-colors">
            {{ event.title }}
          </h3>
        </div>

        <!-- Content -->
        <div class="px-4 pb-2">
          <p class="line-clamp-2 text-sm text-muted-foreground">
            {{ event.description }}
          </p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-4 pb-4 pt-2 text-sm text-muted-foreground">
          <div class="flex items-center gap-1">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="truncate max-w-[120px]">{{ event.location }}</span>
          </div>
          <div class="flex items-center gap-1">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>
              {{ event.participant_count }}/{{ event.capacity }}
            </span>
          </div>
        </div>
      </div>
    </a>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class EventCardComponent {
  @Input() event!: EventWithStats;

  get isPast(): boolean {
    return new Date(this.event.event_date) < new Date();
  }

  get isFull(): boolean {
    return this.event.participant_count >= this.event.capacity;
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'EEEE d MMMM yyyy', { locale: fr });
  }

  getCategoryLabel(category: string): string {
    return categoryLabels[category as keyof typeof categoryLabels] || category;
  }

  getCategoryColor(category: string): string {
    return categoryColors[category as keyof typeof categoryColors] || '';
  }
}
