import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../components/header.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer>
      <div class="container mx-auto px-4 py-8 border-t border-border mt-12">
        <p class="text-center text-muted-foreground text-sm flex items-center justify-center gap-1">
          Made with <span class="text-red-500 text-lg">♥</span> by Group 16
        </p>
      </div>
    </footer>
  `
})
export class PublicLayoutComponent { }
