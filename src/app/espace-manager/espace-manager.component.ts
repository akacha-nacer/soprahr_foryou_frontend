import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger, AnimationEvent } from '@angular/animations';

@Component({
  selector: 'app-espace-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './espace-manager.component.html',
  animations: [
    trigger('notificationSlide', [
      state('visible', style({
        transform: 'translateX(0%)',
        opacity: 1,
        zIndex: 2
      })),
      state('hidden', style({
        transform: 'translateX(-100%)',
        opacity: 1,
        zIndex: 1
      })),
      transition('visible <=> hidden', [
        animate('0.9s cubic-bezier(0.25, 0.8, 0.25, 1)')
      ]),
      // Transition inverse spécifique pour goBack
      transition('hidden => visible', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.9s cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(0%)' }))
      ])
    ]),
    trigger('demandSlide', [
      state('hidden', style({
        transform: 'translateX(100%)',
        opacity: 1,
        zIndex: 1
      })),
      state('visible', style({
        transform: 'translateX(0%)',
        opacity: 1,
        zIndex: 2
      })),
      transition('hidden <=> visible', [
        animate('0.9s cubic-bezier(0.25, 0.8, 0.25, 1)')
      ]),
      transition('visible => hidden', [
        style({ transform: 'translateX(0%)' }),
        animate('0.9s cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ],
  styleUrl: './espace-manager.component.css'
})
export class EspaceManagerComponent {
  showDemands = false;
  isAnimating = false;
  demands = [
    { text: 'Demande 1', date: '29/05/2025' },
    { text: 'Demande 2', date: '28/05/2025' },
    { text: 'Demande 3', date: '27/05/2025' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  toggleDemands() {
    if (this.isAnimating) return;
    this.showDemands = !this.showDemands;
    this.cdr.detectChanges();
  }

  goBack() {
    if (this.isAnimating || !this.showDemands) return;
    this.showDemands = false;
    this.cdr.detectChanges();
  }

  animationStart(event: AnimationEvent) {
    this.isAnimating = true;
    console.log('Animation started:', event);
  }

  animationDone(event: AnimationEvent) {
    this.isAnimating = false;
    console.log('Animation completed:', event);
    this.cdr.detectChanges();
  }

  get notificationState(): string {
    return this.showDemands ? 'hidden' : 'visible';
  }

  get demandState(): string {
    return this.showDemands ? 'visible' : 'hidden';
  }
}
