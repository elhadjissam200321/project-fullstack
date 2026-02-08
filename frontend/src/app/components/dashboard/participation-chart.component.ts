import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import Chart from 'chart.js/auto';

import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-participation-chart',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="glass-card rounded-2xl overflow-hidden h-full flex flex-col stat-animate" style="animation-delay: 400ms">
      <div class="p-6 pb-0">
        <h3 class="text-lg font-bold tracking-tight">Analyse de participation</h3>
        <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Inscriptions (7 derniers jours)</p>
      </div>
      <div class="p-6 flex-1 min-h-[320px] relative">
        <canvas #chartCanvas></canvas>
        <div *ngIf="hasData === false" class="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm m-6 rounded-xl">
          <div class="text-center p-6 grayscale">
            <div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <lucide-icon name="bar-chart-3" class="h-6 w-6 text-muted-foreground"></lucide-icon>
            </div>
            <p class="text-sm font-semibold text-foreground">Pas de données d'analyse</p>
            <p class="text-xs text-muted-foreground mt-1">Les inscriptions récentes apparaîtront ici.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ParticipationChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: { date: string; count: number }[] = [];

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  hasData = true;
  private chart: Chart | null = null;

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    const total = (this.data || []).reduce((s, d) => s + d.count, 0);
    this.hasData = total > 0;
    if (changes['data'] && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  private parseDate(dateStr: string): Date {
    try {
      const d = parseISO(dateStr);
      return isValid(d) ? d : new Date(dateStr);
    } catch {
      return new Date(dateStr);
    }
  }

  private createChart() {
    const canvasEl = this.chartCanvas?.nativeElement;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    // Use refined colors
    const accentColor = '#f97316'; // Using a fixed orange for chart reliability
    const gridColor = 'rgba(220, 220, 220, 0.15)';
    const textColor = '#94a3b8';

    const labels = (this.data || []).map(item => format(this.parseDate(item.date), 'EEE', { locale: fr }));
    const counts = (this.data || []).map(item => item.count);

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(249, 115, 22, 0.2)');
    gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Inscriptions',
          data: counts,
          fill: true,
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          borderColor: accentColor,
          borderWidth: 2,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  private updateChart() {
    if (!this.chart || !this.chartCanvas?.nativeElement) return;

    const labels = (this.data || []).map(item => format(this.parseDate(item.date), 'EEE', { locale: fr }));
    const counts = (this.data || []).map(item => item.count);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = counts;
    this.chart.update('active');
  }

}

