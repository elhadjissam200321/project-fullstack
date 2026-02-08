import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div 
      class="glass-card p-6 rounded-2xl flex flex-col justify-between h-full stat-animate"
      [style.animationDelay]="delay + 'ms'"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
          <lucide-icon [name]="iconName" class="h-5 w-5 text-accent"></lucide-icon>
        </div>
        <div *ngIf="trend" 
             class="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
             [ngClass]="trend.isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'">
          <lucide-icon [name]="trend.isPositive ? 'arrow-up-right' : 'arrow-down-right'" class="h-3 w-3"></lucide-icon>
          {{ trend.value }}%
        </div>
      </div>
      
      <div>
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{{ title }}</p>
        <div class="flex items-baseline gap-1">
          <h3 class="text-3xl font-extrabold tracking-tight text-foreground">{{ value }}</h3>
          <span *ngIf="description" class="text-xs text-muted-foreground font-medium">{{ description }}</span>
        </div>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() iconName: string = 'activity';
  @Input() description?: string;
  @Input() trend?: { value: number; isPositive: boolean };
  @Input() delay: number = 0;
}
