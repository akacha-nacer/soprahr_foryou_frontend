import {AfterViewInit, Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {PopupNatureHeureComponent} from '../popup-nature-heure/popup-nature-heure.component';
import {DataItem, Timeline, TimelineOptions} from 'vis-timeline';
import {DataSet} from 'vis-data';
import {DepartementNaiss} from '../models/DepartementNaiss';
import {NatureHeure} from '../models/journee/NatureHeureModel';
import {Anomalies} from '../models/journee/AnomaliesModel';
import {Pointage} from '../models/journee/PointageModel';
import {JourneeService} from '../services/journee.service';

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

  constructor(private fb: FormBuilder, public dialog: MatDialog, public  journeeService :JourneeService,private cdr: ChangeDetectorRef) {
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
  if (this.userId){
    this.journeeService.getNatureHeures(this.userId).subscribe(value => {
      this.natureHeures = value ;
      console.log(this.natureHeures)
      this.cdr.detectChanges();
    },
      (error) => {
        console.error('Error fetching nature heures :', error);
      });

    this.journeeService.getPointages(this.userId).subscribe(value => {
        this.pointages = value ;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching pointages :', error);
      });

    this.journeeService.getAnomalies(this.userId).subscribe(value => {
        this.anomalies = value ;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching anomalies :', error);
      });
  }
  }

  ngAfterViewInit(): void {
    // Initialize timeline if section5 is already visible
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

    // Create a proper date for today
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    // Create items array
    const itemsArray = [
      {
        id: 1,
        content: 'Absence à tort',
        start: new Date(year, month, day, 9, 0),
        end: new Date(year, month, day, 13, 0),
        title: 'Absence 9h-13h',
        type: 'range',
        className: 'absence-item'
      }
    ];


    const items = new DataSet(itemsArray);


    const options: TimelineOptions = {
      width: "100%",
      height: "200px",
      start: new Date(year, month, day, 7, 0),
      end: new Date(year, month, day, 19, 0),
      min: new Date(year, month, day, 0, 0),
      max: new Date(year, month, day, 23, 59),
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
      stack: true,
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap'
      }
    };

    try {
      // Destroy existing timeline if it exists
      if (this.timeline) {
        this.timeline.destroy();
      }

      // Create new timeline
      this.timeline = new Timeline(container, items, options);
      this.timelineInitialized = true;

      console.log('Timeline initialized successfully:', this.timeline);

      // Force redraw and fit

        if (this.timeline) {
          this.timeline.redraw();
          this.timeline.fit();
          console.log('Timeline redrawn and fitted');
        }


      // Add event listeners
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

  toggleForm(sectionId: string): void {
    this.sectionVisibility[sectionId] = !this.sectionVisibility[sectionId];

    // Initialize timeline when section 5 is opened
    if (sectionId === 'section5' && this.sectionVisibility[sectionId]) {
      setTimeout(() => {
        this.initializeTimeline();
      }, 350); // Wait for animation to complete
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

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.userId) {
        console.log('Nature d\'heure ajoutée :', result);
        this.journeeService.saveNatureHeure(result, this.userId).subscribe({
          next: (response) => {
            console.log('NatureHeure saved:', response);
            this.journeeService.getNatureHeures(this.userId!).subscribe(value => {
              this.natureHeures = value;
              this.cdr.detectChanges();
            });
          },
          error: (error) => console.error('Error saving natureHeure:', error)
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

  openEdit(natureheure: NatureHeure): void {
    const dialogRef = this.dialog.open(PopupNatureHeureComponent, {
      data: { type: 'edit', item: natureheure }
    });

    console.log(natureheure);
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.userId && natureheure.id) {
        console.log('Modification enregistrée :', result);
        this.journeeService.updateNatureHeure(natureheure.id, result, this.userId).subscribe({
          next: (response) => {
            console.log('NatureHeure updated:', response);
            this.journeeService.getNatureHeures(this.userId!).subscribe(value => {
              this.natureHeures = value;
              this.cdr.detectChanges();
            });
          },
          error: (error) => console.error('Error updating natureHeure:', error)
        });
      }
    });
  }

  deleteItem(item: any): void {
    console.log('Suppression de :', item);
  }

  toggleAnomalySection(): void {
    if (this.hasAnomaly) {
      this.sectionVisibility['section2'] = true;
    }
  }
}
