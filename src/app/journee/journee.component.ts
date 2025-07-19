import { AfterViewInit, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PopupNatureHeureComponent } from '../popup-nature-heure/popup-nature-heure.component';
import { DataItem, Timeline, TimelineOptions } from 'vis-timeline';
import { DataSet } from 'vis-data';
import { DepartementNaiss } from '../models/DepartementNaiss';
import { NatureHeure } from '../models/journee/NatureHeureModel';
import { Anomalies } from '../models/journee/AnomaliesModel';
import { Pointage } from '../models/journee/PointageModel';
import { JourneeService } from '../services/journee.service';
import { PopupConfMaladieComponent } from '../popup-conf-maladie/popup-conf-maladie.component';

@Component({
  selector: 'app-journee',
  imports: [CommonModule],
  templateUrl: './journee.component.html',
  styleUrl: './journee.component.css',
  standalone: true,
  animations: [
    trigger('slideDown', [
      state('hidden', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('visible', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden'
      })),
      transition('hidden <=> visible', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class JourneeComponent implements OnInit, AfterViewInit, OnDestroy {
  natureHeuresForm: FormGroup;
  natureHeures: NatureHeure[] = [];
  anomalies: Anomalies[] = [];
  pointages: Pointage[] = [];
  userId: number | null = null;
  userFirstname: string | null = null;
  userIdentifiant: string | null = null;
  userRole: string | null = null;
  userPoste: string | null = null;
  sectionVisibility: { [key: string]: boolean } = {};
  sectionValidationStates: { [key: string]: boolean } = {};
  activeProgressButton: string = 'Créer';
  natureHeuresData = [
    { nature: 'Absence à tort', debut: '09:00', fin: '13:00', duree: '4h00', saisie: '' }
  ];
  timelineHours = Array.from({ length: 25 }, (_, i) => (i === 0 ? '00:00' : `${i}:00`));
  hasAnomaly = true;
  private timeline: Timeline | null = null;
  private timelineInitialized = false;
  private selectedDate: Date = new Date(); // Added to define the day for the timeline

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public journeeService: JourneeService,
    private cdr: ChangeDetectorRef
  ) {
    this.natureHeuresForm = this.fb.group({
      date: ['', [Validators.required]],
      nature: ['', [Validators.required]],
      de: ['', [Validators.required]],
      a: ['', [Validators.required]],
      duree: [{ value: '', disabled: true }],
      commentaire1: [''],
      commentaire2: ['']
    });
  }

  ngOnInit(): void {
    const storedUser = sessionStorage.getItem('user');
    console.log('Stored user from sessionStorage:', storedUser);

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userId = user.userID !== undefined && user.userID !== null ? parseInt(user.userID, 10) : null;
        this.userFirstname = user.firstname !== undefined && user.firstname !== null ? user.firstname : null;
        this.userIdentifiant = user.identifiant !== undefined && user.identifiant !== null ? user.identifiant : null;
        this.userRole = user.role !== undefined && user.role !== null ? user.role : null;
        this.userPoste = user.poste !== undefined && user.poste !== null ? user.poste : null;
        console.log(this.userId);
      } catch (e) {
        console.error('Error parsing user from sessionStorage:', e);
      }
    } else {
      console.warn('No user found in sessionStorage');
    }

    this.sectionVisibility['section1'] = false;
    this.sectionVisibility['section2'] = false;
    this.sectionVisibility['section3'] = false;
    this.sectionVisibility['section4'] = false;
    this.sectionVisibility['section5'] = false;
    this.sectionValidationStates['section1'] = false;
    this.sectionValidationStates['section2'] = false;
    this.sectionValidationStates['section3'] = false;
    this.sectionValidationStates['section4'] = false;
    this.sectionValidationStates['section5'] = false;

    this.natureHeuresForm.markAllAsTouched();
    if (this.userId) {
      this.journeeService.getNatureHeures(this.userId).subscribe(
        value => {
          this.natureHeures = value;
          console.log(this.natureHeures);
          this.cdr.detectChanges();
          // Update timeline if section5 is visible
          if (this.sectionVisibility['section5'] && this.timeline) {
            this.updateTimeline();
          }
        },
        error => {
          console.error('Error fetching nature heures :', error);
        }
      );

      this.journeeService.getAllPointages(this.userId).subscribe(
        value => {
          this.pointages = value;
          this.cdr.detectChanges();
        },
        error => {
          console.error('Error fetching pointages :', error);
        }
      );

      this.journeeService.getAllUserAnomalies(this.userId).subscribe(
        value => {
          this.anomalies = value;
          this.cdr.detectChanges();
        },
        error => {
          console.error('Error fetching anomalies :', error);
        }
      );
    }
  }

  ngAfterViewInit(): void {
    if (this.sectionVisibility['section5']) {
      setTimeout(() => {
        this.initializeTimeline();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.timeline) {
      this.timeline.destroy();
      this.timeline = null;
    }
  }


  private fixPointageStyles(): void {
    setTimeout(() => {
      // Sélectionner tous les points de pointage après que la timeline soit rendue
      const pointagePoints = document.querySelectorAll('.vis-item.vis-point.pointage-entry, .vis-item.vis-point.pointage-exit');

      pointagePoints.forEach((point: Element) => {
        const htmlPoint = point as HTMLElement;

        // Masquer complètement le point par défaut
        const dotElement = htmlPoint.querySelector('.vis-dot') as HTMLElement;
        if (dotElement) {
          dotElement.style.display = 'none';
          dotElement.style.visibility = 'hidden';
          dotElement.style.opacity = '0';
        }

        // Créer un élément triangle personnalisé
        let triangleElement = htmlPoint.querySelector('.custom-triangle') as HTMLElement;
        if (!triangleElement) {
          triangleElement = document.createElement('div');
          triangleElement.className = 'custom-triangle';

          const isEntry = htmlPoint.classList.contains('pointage-entry');
          const color = isEntry ? '#4caf50' : '#d32f2f';

          triangleElement.style.cssText = `
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 0 !important;
          height: 0 !important;
          border-left: 6px solid transparent !important;
          border-right: 6px solid transparent !important;
          border-bottom: 10px solid ${color} !important;
          z-index: 999 !important;
          pointer-events: none !important;
        `;

          htmlPoint.appendChild(triangleElement);
        }

        // S'assurer que le conteneur principal a les bonnes dimensions
        htmlPoint.style.cssText += `
        width: 12px !important;
        height: 10px !important;
        background: transparent !important;
        border: none !important;
        position: relative !important;
      `;
      });
    }, 500); // Délai pour s'assurer que la timeline est complètement rendue
  }
  private initializeTimeline(): void {
    if (this.timelineInitialized) {
      return;
    }

    const container = document.getElementById('timelineContainer');
    if (!container) {
      console.error('Timeline container not found.');
      return;
    }

    console.log('Container found:', container);
    console.log('Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);

    const items = new DataSet(this.getTimelineItems());
    console.log('All items in DataSet:', items.get());
    const options: TimelineOptions = this.getTimelineOptions();

    try {
      if (this.timeline) {
        this.timeline.destroy();
      }

      this.timeline = new Timeline(container, items, options);
      this.timelineInitialized = true;

      console.log('Timeline initialized successfully:', this.timeline);

      if (this.timeline) {
        this.timeline.redraw();
        this.timeline.fit();
        console.log('Timeline redrawn and fitted');
      }

        this.fixPointageStyles();


      this.timeline.on('select', (event) => {
        console.log('Item selected:', event);
      });

      this.timeline.on('click', (event) => {
        console.log('Timeline clicked:', event);
      });

    } catch (error) {
      console.error('Timeline initialization failed:', error);
    }
  }

  private getTimelineItems(): DataItem[] {
    const selectedDate = this.selectedDate;
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth(); // 0-based
    const day = selectedDate.getDate();

    // Define static periods
    const workPeriods = [
      { start: new Date(year, month, day, 9, 0), end: new Date(year, month, day, 13, 0) },
      { start: new Date(year, month, day, 14, 0), end: new Date(year, month, day, 17, 0) }
    ];

    // Static items as range items
    const backgroundItems: DataItem[] = [
      ...workPeriods.map((period, index) => ({
        id: `work-${index}`,
        start: period.start,
        end: period.end,
        type: 'range',
        className: 'work-range',
        content: '.',
        style: 'background-color: #6d94d4;border: 1px solid rgba(0, 105, 151, 0.38); opacity: 0.6; z-index: 0;'
      }))
    ];

    // Filter dynamic items by today's date or nature_heure: "Déjeuner"
    const selectedNatureHeures = this.natureHeures.filter(nh => {
      if (!nh.date) {
        console.warn(`Skipping natureHeure with undefined date:`, nh);
        return false;
      }
      // Always include "Déjeuner" regardless of date
      if (nh.nature_heure.toLowerCase() === 'déjeuner') {
        console.log(`Including Déjeuner regardless of date: ${nh.date} for ${nh.nature_heure}`);
        return true;
      }
      // Normalize date in local timezone
      let nhDate: Date;
      if (typeof nh.date === 'string') {
        const cleanedDate = nh.date.replace(' ', 'T').replace(/(\d{4}-\d{2}-\d{2}).*/, '$1');
        nhDate = new Date(cleanedDate);
      } else {
        nhDate = new Date(nh.date);
      }
      if (isNaN(nhDate.getTime())) {
        console.warn(`Skipping natureHeure with invalid date: ${nh.date}`, nh);
        return false;
      }
      // Compare dates in local timezone
      const nhYear = nhDate.getFullYear();
      const nhMonth = nhDate.getMonth();
      const nhDay = nhDate.getDate();
      console.log(`Comparing dates: ${nhYear}-${nhMonth + 1}-${nhDay} vs ${year}-${month + 1}-${day} for nature_heure: ${nh.nature_heure}`);
      return nhYear === year && nhMonth === month && nhDay === day;
    });

    // Dynamic items
    const dynamicItems: DataItem[] = selectedNatureHeures.map(nh => {
      const startTime = this.parseTime(nh.heureDebut);
      const endTime = this.parseTime(nh.heureFin);
      return {
        id: nh.id,
        content: nh.nature_heure,
        start: new Date(year, month, day, startTime.hours, startTime.minutes),
        end: new Date(year, month, day, endTime.hours, endTime.minutes),
        type: 'range',
        className: 'nature-heure-item',
        style: 'background-color: #015980; border: 1px solid rgba(0, 105, 151, 0.38); z-index: 10;color: #edebeb; font-family: OpenSans, sans-serif'
      };
    });

    // Filter pointages by today's date
    const pointageItems: DataItem[] = this.pointages.map(p => {
      const time = this.parseTime(p.heure);
      return {
        id: `pointage-${p.id}`,
        content: p.sens === "ENTREE" ? 'Entrée' : 'Sortie',
        start: new Date(year, month, day, time.hours, time.minutes),
        type: 'point',
        className: p.sens === "ENTREE" ? 'pointage-entry' : 'pointage-exit',
        style: `
      /* Masquer complètement le point par défaut */
      background: none !important;
      border: none !important;
      top:37px;
      border-radius: 0 !important;
      width: 0 !important;
      height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;

      /* Créer le triangle avec des pseudo-éléments via CSS-in-JS */
      position: relative !important;

      /* Utiliser box-shadow pour créer le triangle car on ne peut pas utiliser ::before/::after en inline */
      box-shadow:
        -6px 10px 0 -6px transparent,
        0px 10px 0 -6px ${p.sens === "ENTREE" ? '#4caf50' : '#d32f2f'},
        6px 10px 0 -6px transparent !important;

      /* Alternative avec border pour créer le triangle */
      border-left: 6px solid transparent !important;
      border-right: 6px solid transparent !important;
      border-bottom: 10px solid ${p.sens === "ENTREE" ? '#4caf50' : '#d32f2f'} !important;
      border-top: none !important;

      /* S'assurer que l'élément est visible */
      opacity: 1 !important;
      visibility: visible !important;
      z-index: 999 !important;

      /* Réinitialiser les dimensions pour le triangle */
      min-width: 12px !important;
      min-height: 10px !important;
      max-width: 12px !important;
      max-height: 10px !important;
    `,
        title: `${p.sens === "ENTREE" ? 'Entrée' : 'Sortie'} à ${p.heure} (${p.naturePointage})`
      };
    });

    console.log('Background items:', backgroundItems.length);
    console.log('Dynamic items:', dynamicItems.length);
    console.log('Pointage items:', pointageItems.length);
    console.log('Pointage items details:', pointageItems);
    console.log('Selected pointages:', this.pointages);
    console.log('All items:', [...backgroundItems, ...dynamicItems, ...pointageItems]);
    return [...backgroundItems, ...dynamicItems, ...pointageItems];
  }

  /** Helper method to define timeline options */
  private getTimelineOptions(): TimelineOptions {
    const selectedDate = this.selectedDate;
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    return {
      width: "100%",
      height: "200px",
      start: new Date(year, month, day, 0, 0),
      end: new Date(year, month, day + 1, 0, 0),
      min: new Date(year, month, day, 0, 0),
      max: new Date(year, month, day + 1, 0, 0),
      zoomMin: 1000 * 60 * 60, // 1 hour
      zoomMax: 1000 * 60 * 60 * 24, // 1 day
      orientation: 'top',
      showCurrentTime: true,
      format: {
        minorLabels: {
          hour: 'HH:mm',
          day: 'DD/MM'
        },
        majorLabels: {
          hour: 'DD/MM/YYYY',
          day: 'MMMM YYYY'
        }
      },
      timeAxis: {
        scale: 'hour',
        step: 1
      },
      margin: {
        item: 10,
        axis: 20
      },
      editable: false,
      selectable: true,
      stack: false,
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap'
      }
    };
  }

  /** Parse time string into hours and minutes */
  private parseTime(timeStr: string): { hours: number, minutes: number } {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  }

  /** Update the timeline when data changes */
  private updateTimeline(): void {
    if (this.timeline) {
      const newItems = new DataSet(this.getTimelineItems());
      this.timeline.setItems(newItems);
      this.timeline.redraw();
      this.timeline.fit();
      this.fixPointageStyles();
    }
  }

  toggleForm(sectionId: string): void {
    this.sectionVisibility[sectionId] = !this.sectionVisibility[sectionId];
    if (sectionId === 'section5' && this.sectionVisibility[sectionId]) {
      setTimeout(() => {
        this.initializeTimeline();
      }, 350);
    }
  }

  onSubmit(sectionId: string): void {
    if (sectionId === 'section3' && this.natureHeuresForm.valid) {
      this.sectionValidationStates[sectionId] = true;
      console.log(`Formulaire ${sectionId} soumis avec succès :`, this.natureHeuresForm.value);
      this.sectionVisibility[sectionId] = false;
    } else {
      this.sectionValidationStates[sectionId] = false;
      console.log(`Formulaire ${sectionId} invalide`);
    }
  }

  openAddNatureHeure(): void {
    const dialogRef = this.dialog.open(PopupNatureHeureComponent, {
      data: { type: 'add' }
    });

    dialogRef.afterClosed().subscribe(formResult => {
      if (formResult && this.userId) {
        if (!formResult.nature_heure || !formResult.heureDebut || !formResult.heureFin) {
          console.error('Validation failed: Missing required fields');
          return;
        }

        // Normalize date to match selectedDate
        formResult.date = this.selectedDate.toISOString().split('T')[0]; // e.g., "2025-07-19"
        console.log('Form result before saving:', formResult);

        const confirmDialogRef = this.dialog.open(PopupConfMaladieComponent, {
          data: {
            message: this.userRole === 'MANAGER'
              ? `Voulez-vous vraiment ajouter la nature d’heure "${formResult.nature_heure}" ?`
              : `Voulez-vous soumettre une demande pour ajouter la nature d’heure "${formResult.nature_heure}" ?`
          }
        });

        confirmDialogRef.afterClosed().subscribe(confirmResult => {
          if (confirmResult) {
            this.journeeService.saveNatureHeure(formResult, this.userId!).subscribe({
              next: (response) => {
                console.log('NatureHeure saved:', response);
                this.journeeService.getNatureHeures(this.userId!).subscribe({
                  next: (value) => {
                    this.natureHeures = value;
                    console.log('Updated natureHeures:', value);
                    this.cdr.detectChanges();
                    // Force section5 visibility and timeline update
                    this.sectionVisibility['section5'] = true;
                    setTimeout(() => {
                      if (this.timeline) {
                        this.updateTimeline();
                      } else {
                        this.initializeTimeline();
                      }
                    }, 350);
                  },
                  error: (error) => {
                    console.error('Error fetching natureHeures:', error);
                  }
                });
              },
              error: (error) => {
                console.error('Error saving natureHeure:', error);
              }
            });
          }
        });
      }
    });
  }

  openDetail(natureheure: NatureHeure): void {
    const dialogRef = this.dialog.open(PopupNatureHeureComponent, {
      data: { type: 'detail', item: natureheure }
    });
    console.log(natureheure);

    dialogRef.afterClosed().subscribe(result => {
      if (result) console.log('Détail affiché :', result);
    });
  }

  openEdit(natureHeure: NatureHeure): void {
    if (!natureHeure.id) {
      console.error('Invalid natureHeure ID');
      return;
    }

    const dialogRef = this.dialog.open(PopupNatureHeureComponent, {
      data: { type: 'edit', item: natureHeure }
    });

    dialogRef.afterClosed().subscribe(formResult => {
      if (formResult && this.userId) {
        if (!formResult.nature_heure || !formResult.heureDebut || !formResult.heureFin || !formResult.date) {
          console.error('Validation failed: Missing required fields');
          return;
        }

        const confirmDialogRef = this.dialog.open(PopupConfMaladieComponent, {
          data: {
            message: this.userRole === 'MANAGER'
              ? `Voulez-vous vraiment modifier la nature d’heure "${formResult.nature_heure}" ?`
              : `Voulez-vous soumettre une demande de modification pour la nature d’heure "${formResult.nature_heure}" ?`
          }
        });

        confirmDialogRef.afterClosed().subscribe(confirmResult => {
          if (confirmResult) {
            this.journeeService.updateNatureHeure(natureHeure.id!, formResult, this.userId!).subscribe({
              next: (response) => {
                console.log('NatureHeure updated:', response);
                this.journeeService.getNatureHeures(this.userId!).subscribe({
                  next: (value) => {
                    this.natureHeures = value;
                    this.cdr.detectChanges();
                    if (this.sectionVisibility['section5'] && this.timeline) {
                      this.updateTimeline();
                    }
                  },
                  error: (error) => {
                    console.error('Error fetching natureHeures:', error);
                  }
                });
              },
              error: (error) => {
                console.error('Error updating natureHeure:', error);
              }
            });
          }
        });
      }
    });
  }

  deleteItem(natureHeure: NatureHeure): void {
    if (!natureHeure.id || !this.userId) {
      console.error('Invalid natureHeure ID or user ID');
      return;
    }

    const message = this.userRole === 'MANAGER'
      ? `Voulez-vous vraiment supprimer la nature d'heure "${natureHeure.nature_heure}"?`
      : `Voulez-vous soumettre une demande de suppression pour la nature d'heure "${natureHeure.nature_heure}" ?`;

    const dialogRef = this.dialog.open(PopupConfMaladieComponent, {
      data: { message }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.userId) {
        if (this.userRole === 'MANAGER') {
          this.journeeService.deleteNatureHeure(natureHeure.id!, this.userId).subscribe({
            next: (response) => {
              console.log('NatureHeure deleted:', response);
              this.journeeService.getNatureHeures(this.userId!).subscribe(value => {
                this.natureHeures = value;
                this.cdr.detectChanges();
                if (this.sectionVisibility['section5'] && this.timeline) {
                  this.updateTimeline();
                }
              });
            },
            error: (error) => console.error('Error deleting natureHeure:', error)
          });
        } else {
          this.journeeService.requestNatureHeureDeletion(natureHeure.id!, this.userId).subscribe({
            next: (response) => {
              console.log('Deletion request submitted:', response);
              this.cdr.detectChanges();
            },
            error: (error) => console.error('Error submitting deletion request:', error)
          });
        }
      }
    });
  }

  toggleAnomalySection(): void {
    if (this.hasAnomaly) {
      this.sectionVisibility['section2'] = true;
    }
  }
}
