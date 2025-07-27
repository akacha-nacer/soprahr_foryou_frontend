import { AfterViewInit, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PopupNatureHeureComponent } from '../popup-nature-heure/popup-nature-heure.component';
import { DataItem, Timeline, TimelineOptions } from 'vis-timeline';
import { DataSet } from 'vis-data';
import { NatureHeure } from '../models/journee/NatureHeureModel';
import { Anomalies } from '../models/journee/AnomaliesModel';
import { Pointage } from '../models/journee/PointageModel';
import { JourneeService } from '../services/journee.service';
import { PopupConfMaladieComponent } from '../popup-conf-maladie/popup-conf-maladie.component';
import { Subject, takeUntil } from 'rxjs';
import { NatureHeureRequest } from '../models/journee/NatureHeureRequestModel';
import { NatureHeureModificationRequest } from '../models/journee/NatureHeureModificationRequestModel';
import { NatureHeureDeletionRequest } from '../models/journee/NatureHeureDeletionRequestModel';
import {ToastrService} from 'ngx-toastr';

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
  allNatureHeures: NatureHeure[] = [];
  allAnomalies: Anomalies[] = [];
  allPointages: Pointage[] = [];
  pendingNatureHeureRequests: NatureHeureRequest[] = [];
  pendingModificationRequests: NatureHeureModificationRequest[] = [];
  pendingDeletionRequests: NatureHeureDeletionRequest[] = [];
  userId: number | null = null;
  userFirstname: string | null = null;
  userIdentifiant: string | null = null;
  userRole: string | null = null;
  userPoste: string | null = null;
  sectionVisibility: { [key: string]: boolean } = {};
  sectionValidationStates: { [key: string]: boolean } = {};
  viewMode: 'current' | 'historique' | 'enCours' = 'current';
  absences = [
    { code: 'ABR', libelle: 'absence diverse', matin: '-', apresMidi: '-', debut: '09:00', fin: '17:00' }
  ];
  // Pagination properties for absences
  absencesCurrentPage: number = 1;
  absencesItemsPerPage: number = 5;
  absencesTotalPages: number = 1;
  filteredAbsences: any[] = [];
  // Pagination properties for anomalies
  anomaliesCurrentPage: number = 1;
  anomaliesItemsPerPage: number = 5;
  anomaliesTotalPages: number = 1;
  filteredAnomalies: Anomalies[] = [];
  // Pagination properties for nature heures
  natureHeuresCurrentPage: number = 1;
  natureHeuresItemsPerPage: number = 5;
  natureHeuresTotalPages: number = 1;
  filteredNatureHeures: NatureHeure[] = [];
  // Pagination properties for pointages
  pointagesCurrentPage: number = 1;
  pointagesItemsPerPage: number = 5;
  pointagesTotalPages: number = 1;
  filteredPointages: Pointage[] = [];
  activeProgressButton: string = 'Créer';
  timelineHours = Array.from({ length: 25 }, (_, i) => (i === 0 ? '00:00' : `${i}:00`));
  hasAnomaly = false;
  private timeline: Timeline | null = null;
  private timelineInitialized = false;
  private selectedDate: Date = new Date();
  private destroy$ = new Subject<void>();
  private anomaliesGenerated = false;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public journeeService: JourneeService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
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
        console.log('Parsed userId:', this.userId);
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
      this.fetchCurrentViewData();
      if (!this.anomaliesGenerated) {
        const today = new Date().toISOString().split('T')[0];
        this.anomaliesGenerated = true;
        this.journeeService.generateAnomaliesForUser(this.userId, today).subscribe({
          next: (anomalies) => {
            console.log('Anomalies generated for today:', anomalies);
            this.fetchAnomalies();
          },
          error: (error) => {
            console.error('Error generating anomalies:', error);
            this.fetchAnomalies();
          }
        });
      }
    }
  }

  private fetchAnomalies(): void {
    if (!this.userId) return;
    this.journeeService.getUserAnomaliesForToday(this.userId).subscribe({
      next: (value) => {
        this.anomalies = value;
        this.hasAnomaly = value.length > 0;
        console.log('Today\'s anomalies:', this.anomalies);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching today\'s anomalies:', error);
      }
    });
  }

  private fetchCurrentViewData(): void {
    if (!this.userId) return;
    const today = this.selectedDate.toISOString().split('T')[0];

    this.journeeService.getNatureHeures(this.userId)
      .subscribe({
        next: (value) => {
          this.natureHeures = this.filterByDate(value, this.selectedDate, nh => nh.nature_heure?.toLowerCase() === 'déjeuner');
          this.cdr.detectChanges();
          if (this.sectionVisibility['section5'] && this.timeline) {
            this.updateTimeline();
          }
        },
        error: (error) => {
          console.error('Error fetching nature heures:', error);
        }
      });

    this.journeeService.getAllPointages(this.userId)
      .subscribe({
        next: (value) => {
          this.pointages = this.filterByDate(value, this.selectedDate);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching pointages:', error);
        }
      });

    this.fetchAnomalies();
  }

  private fetchHistoriqueData(): void {
    if (!this.userId) return;

    this.journeeService.getNatureHeures(this.userId)
      .subscribe({
        next: (value) => {
          this.allNatureHeures = value;
          this.filteredNatureHeures = [...value]; // Initialize filtered data
          this.updateNatureHeuresPagination();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching all nature heures:', error);
        }
      });

    this.journeeService.getAllPointages(this.userId)
      .subscribe({
        next: (value) => {
          this.allPointages = value;
          this.filteredPointages = [...value]; // Initialize filtered data
          this.updatePointagesPagination();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching all pointages:', error);
        }
      });

    this.journeeService.getAllUserAnomalies(this.userId)
      .subscribe({
        next: (value) => {
          this.allAnomalies = value;
          this.filteredAnomalies = [...value]; // Initialize filtered data
          this.updateAnomaliesPagination();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching all anomalies:', error);
        }
      });

    this.filteredAbsences = [...this.absences]; // Initialize filtered absences
    this.updateAbsencesPagination();
  }

  private fetchEnCoursData(): void {
    if (!this.userId) return;

    this.journeeService.getNatureHeureRequests(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.pendingNatureHeureRequests = value.filter(request => request.status === 'PENDING');
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching nature heure requests:', error);
        }
      });

    this.journeeService.getNatureHeureModifRequests(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.pendingModificationRequests = value.filter(request => !request.approved && !request.rejected);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching modification requests:', error);
        }
      });

    this.journeeService.getNatureHeureDelRequests(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.pendingDeletionRequests = value.filter(request => !request.approved && !request.rejected);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching deletion requests:', error);
        }
      });
  }

  // Pagination methods for absences
  get paginatedAbsences(): any[] {
    const startIndex = (this.absencesCurrentPage - 1) * this.absencesItemsPerPage;
    const endIndex = startIndex + this.absencesItemsPerPage;
    return this.filteredAbsences.slice(startIndex, endIndex);
  }

  updateAbsencesPagination(): void {
    this.absencesTotalPages = Math.ceil(this.filteredAbsences.length / this.absencesItemsPerPage);
    if (this.absencesCurrentPage > this.absencesTotalPages) {
      this.absencesCurrentPage = this.absencesTotalPages > 0 ? this.absencesTotalPages : 1;
    }
  }

  get absencesPageNumbers(): number[] {
    return Array.from({ length: this.absencesTotalPages }, (_, i) => i + 1);
  }

  goToAbsencesPage(page: number): void {
    if (page >= 1 && page <= this.absencesTotalPages) {
      this.absencesCurrentPage = page;
      this.cdr.detectChanges();
    }
  }

  // Pagination methods for anomalies
  get paginatedAnomalies(): Anomalies[] {
    const startIndex = (this.anomaliesCurrentPage - 1) * this.anomaliesItemsPerPage;
    const endIndex = startIndex + this.anomaliesItemsPerPage;
    return this.filteredAnomalies.slice(startIndex, endIndex);
  }

  updateAnomaliesPagination(): void {
    this.anomaliesTotalPages = Math.ceil(this.filteredAnomalies.length / this.anomaliesItemsPerPage);
    if (this.anomaliesCurrentPage > this.anomaliesTotalPages) {
      this.anomaliesCurrentPage = this.anomaliesTotalPages > 0 ? this.anomaliesTotalPages : 1;
    }
  }

  get anomaliesPageNumbers(): number[] {
    return Array.from({ length: this.anomaliesTotalPages }, (_, i) => i + 1);
  }

  goToAnomaliesPage(page: number): void {
    if (page >= 1 && page <= this.anomaliesTotalPages) {
      this.anomaliesCurrentPage = page;
      this.cdr.detectChanges();
    }
  }

  // Pagination methods for nature heures
  get paginatedNatureHeures(): NatureHeure[] {
    const startIndex = (this.natureHeuresCurrentPage - 1) * this.natureHeuresItemsPerPage;
    const endIndex = startIndex + this.natureHeuresItemsPerPage;
    return this.filteredNatureHeures.slice(startIndex, endIndex);
  }

  updateNatureHeuresPagination(): void {
    this.natureHeuresTotalPages = Math.ceil(this.filteredNatureHeures.length / this.natureHeuresItemsPerPage);
    if (this.natureHeuresCurrentPage > this.natureHeuresTotalPages) {
      this.natureHeuresCurrentPage = this.natureHeuresTotalPages > 0 ? this.natureHeuresTotalPages : 1;
    }
  }

  get natureHeuresPageNumbers(): number[] {
    return Array.from({ length: this.natureHeuresTotalPages }, (_, i) => i + 1);
  }

  goToNatureHeuresPage(page: number): void {
    if (page >= 1 && page <= this.natureHeuresTotalPages) {
      this.natureHeuresCurrentPage = page;
      this.cdr.detectChanges();
    }
  }

  // Pagination methods for pointages
  get paginatedPointages(): Pointage[] {
    const startIndex = (this.pointagesCurrentPage - 1) * this.pointagesItemsPerPage;
    const endIndex = startIndex + this.pointagesItemsPerPage;
    return this.filteredPointages.slice(startIndex, endIndex);
  }

  updatePointagesPagination(): void {
    this.pointagesTotalPages = Math.ceil(this.filteredPointages.length / this.pointagesItemsPerPage);
    if (this.pointagesCurrentPage > this.pointagesTotalPages) {
      this.pointagesCurrentPage = this.pointagesTotalPages > 0 ? this.pointagesTotalPages : 1;
    }
  }

  get pointagesPageNumbers(): number[] {
    return Array.from({ length: this.pointagesTotalPages }, (_, i) => i + 1);
  }

  goToPointagesPage(page: number): void {
    if (page >= 1 && page <= this.pointagesTotalPages) {
      this.pointagesCurrentPage = page;
      this.cdr.detectChanges();
    }
  }

  toggleViewMode(mode: 'current' | 'historique' | 'enCours'): void {
    this.activeProgressButton = mode === 'current' ? 'Créer' : mode === 'historique' ? 'Historique' : 'En Cours';
    this.viewMode = mode;
    if (mode === 'historique') {
      this.fetchHistoriqueData();
      if (this.timeline) {
        this.timeline.destroy();
        this.timeline = null;
        this.timelineInitialized = false;
      }
    } else if (mode === 'enCours') {
      this.fetchEnCoursData();
      if (this.timeline) {
        this.timeline.destroy();
        this.timeline = null;
        this.timelineInitialized = false;
      }
    } else {
      this.fetchCurrentViewData();
      if (this.sectionVisibility['section5']) {
        setTimeout(() => this.initializeTimeline(), 350);
      }
    }
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    if (this.sectionVisibility['section5']) {
      setTimeout(() => {
        this.initializeTimeline();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timeline) {
      this.timeline.destroy();
      this.timeline = null;
    }
  }

  private filterByDate<T extends { date?: string | Date; createdAt?: string | Date; nature_heure?: string }>(
    items: T[],
    selectedDate: Date,
    includeSpecialCases: (item: T) => boolean = () => false
  ): T[] {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return items.filter(item => {
      if (includeSpecialCases(item)) return true;
      let itemDate: Date;
      const dateField = (item.date || item.createdAt) as string | Date;
      if (typeof dateField === 'string') {
        const cleanedDate = dateField.replace(' ', 'T').replace(/(\d{4}-\d{2}-\d{2}).*/, '$1');
        itemDate = new Date(cleanedDate);
      } else {
        itemDate = new Date(dateField);
      }
      if (isNaN(itemDate.getTime())) {
        console.warn(`Skipping item with invalid date:`, item);
        return false;
      }
      return itemDate.toISOString().split('T')[0] === selectedDateStr;
    });
  }

  private fixPointageStyles(): void {
    setTimeout(() => {
      const pointagePoints = document.querySelectorAll('.vis-item.vis-point.pointage-entry, .vis-item.vis-point.pointage-exit');
      pointagePoints.forEach((point: Element) => {
        const htmlPoint = point as HTMLElement;
        const dotElement = htmlPoint.querySelector('.vis-dot') as HTMLElement;
        if (dotElement) {
          dotElement.style.display = 'none';
          dotElement.style.visibility = 'hidden';
          dotElement.style.opacity = '0';
        }
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
          `;
          htmlPoint.appendChild(triangleElement);
        }
        htmlPoint.style.cssText += `
          width: 12px !important;
          height: 10px !important;
          background: transparent !important;
          border: none !important;
          position: relative !important;
        `;
      });
    }, 500);
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
    const

      items = new DataSet(this.getTimelineItems());
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
      this.timeline.on('click', (event) => {
        console.log('Timeline clicked:', event);
        const { item } = event;
        if (item) {
          if (typeof item === 'string' && item.startsWith('pointage-')) {
            const pointageId = parseInt(item.replace('pointage-', ''), 10);
            this.navigateToPointage(pointageId);
          } else if (typeof item === 'string' && item.startsWith('work-')) {
            console.log('Clicked work-range item, ignoring:', item);
          } else if (typeof item === 'number' || (typeof item === 'string' && !isNaN(parseInt(item, 10)))) {
            const natureHeureId = typeof item === 'number' ? item : parseInt(item, 10);
            this.navigateToNatureHeure(natureHeureId);
          } else {
            console.warn('Unknown item clicked:', item);
          }
        }
      });
      this.timeline.on('select', (event) => {
        console.log('Item selected:', event);
      });
    } catch (error) {
      console.error('Timeline initialization failed:', error);
    }
  }

  private navigateToPointage(pointageId: number): void {
    if (!this.sectionVisibility['section4']) {
      this.sectionVisibility['section4'] = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        const row = document.getElementById(`pointage-row-${pointageId}`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.classList.add('highlight');
          setTimeout(() => row.classList.remove('highlight'), 2000);
        } else {
          console.warn(`Pointage row with ID pointage-row-${pointageId} not found`);
        }
      }, 350);
    } else {
      const row = document.getElementById(`pointage-row-${pointageId}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('highlight');
        setTimeout(() => row.classList.remove('highlight'), 2000);
      } else {
        console.warn(`Pointage row with ID pointage-row-${pointageId} not found`);
      }
    }
  }

  private navigateToNatureHeure(natureHeureId: number): void {
    if (!this.sectionVisibility['section3']) {
      this.sectionVisibility['section3'] = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        const row = document.getElementById(`nature-heure-row-${natureHeureId}`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.classList.add('highlight');
          setTimeout(() => row.classList.remove('highlight'), 2000);
        } else {
          console.warn(`NatureHeure row with ID nature-heure-row-${natureHeureId} not found`);
        }
      }, 350);
    } else {
      const row = document.getElementById(`nature-heure-row-${natureHeureId}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('highlight');
        setTimeout(() => row.classList.remove('highlight'), 2000);
      } else {
        console.warn(`NatureHeure row with ID nature-heure-row-${natureHeureId} not found`);
      }
    }
  }

  private getTimelineItems(): DataItem[] {
    const selectedDate = this.selectedDate;
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    const workPeriods = [
      { start: new Date(year, month, day, 9, 0), end: new Date(year, month, day, 13, 0) },
      { start: new Date(year, month, day, 14, 0), end: new Date(year, month, day, 17, 0) }
    ];

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

    const selectedNatureHeures = this.natureHeures.filter(nh => {
      if (!nh.date) {
        console.warn(`Skipping natureHeure with undefined date:`, nh);
        return false;
      }
      if (nh.nature_heure.toLowerCase() === 'déjeuner') {
        console.log(`Including Déjeuner regardless of date: ${nh.date} for ${nh.nature_heure}`);
        return true;
      }
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
      const nhYear = nhDate.getFullYear();
      const nhMonth = nhDate.getMonth();
      const nhDay = nhDate.getDate();
      console.log(`Comparing dates: ${nhYear}-${nhMonth + 1}-${nhDay} vs ${year}-${month + 1}-${day} for nature_heure: ${nh.nature_heure}`);
      return nhYear === year && nhMonth === month && nhDay === day;
    });

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

    const pointageItems: DataItem[] = this.pointages.map(p => {
      const time = this.parseTime(p.heure);
      return {
        id: `pointage-${p.id}`,
        content: p.sens === "ENTREE" ? 'Entrée' : 'Sortie',
        start: new Date(year, month, day, time.hours, time.minutes),
        type: 'point',
        className: p.sens === "ENTREE" ? 'pointage-entry' : 'pointage-exit',
        style: 'top:37px;',
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
      zoomMin: 1000 * 60 * 60,
      zoomMax: 1000 * 60 * 60 * 24,
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

  private parseTime(timeStr: string): { hours: number, minutes: number } {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  }

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
    if (!this.userId) {
      this.toastr.error('Veuillez vous connecter.', 'Erreur : Aucun ID d\'utilisateur trouvé');
      return;
    }

    if (sectionId === 'section3' && this.natureHeuresForm.valid) {
      this.sectionValidationStates[sectionId] = true;
      this.toastr.success(`Formulaire ${sectionId} soumis avec succès.`, 'Succès');
      this.sectionVisibility[sectionId] = false;
    } else {
      this.sectionValidationStates[sectionId] = false;
      this.toastr.error(`Veuillez remplir tous les champs requis pour ${sectionId}.`, 'Formulaire Invalide');
    }
  }

  openAddNatureHeure(): void {
    const dialogRef = this.dialog.open(PopupNatureHeureComponent, {
      data: { type: 'add' }
    });

    dialogRef.afterClosed().subscribe(formResult => {
      if (formResult && this.userId) {
        if (!formResult.nature_heure || !formResult.heureDebut || !formResult.heureFin) {
          this.toastr.error('Champs requis manquants : nature, heure de début ou heure de fin.', 'Erreur');
          return;
        }
        formResult.date = this.selectedDate.toISOString().split('T')[0];
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
                if (this.userRole === 'EMPLOYEE') {
                  this.toastr.success(`Demande d'ajout pour "${formResult.nature_heure}" envoyée avec succès.`, 'Succès');}else {
                  this.toastr.success(`Nature d’heure "${formResult.nature_heure}" ajoutée avec succès.`, 'Succès');

                }
                this.journeeService.getNatureHeures(this.userId!)
                  .subscribe({
                    next: (value) => {
                      this.natureHeures = this.filterByDate(value, this.selectedDate, nh => nh.nature_heure?.toLowerCase() === 'déjeuner');
                      this.cdr.detectChanges();
                      if (this.sectionVisibility['section5'] && this.timeline) {
                        setTimeout(() => {
                          if (this.timeline) {
                            this.updateTimeline();
                          } else {
                            this.initializeTimeline();
                          }
                        }, 350);
                      }
                    },
                    error: (error) => {
                      this.toastr.error('Erreur lors de la récupération des natures d’heures.', 'Erreur');
                    }
                  });
              },
              error: (error) => {
                this.toastr.error(`Erreur lors de l’ajout de la nature d’heure "${formResult.nature_heure}".`, 'Erreur');
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
      this.toastr.error('ID de nature d’heure invalide.', 'Erreur');
      return;
    }
    const dialogRef = this.dialog.open(PopupNatureHeureComponent, {
      data: { type: 'edit', item: natureHeure }
    });
    dialogRef.afterClosed().subscribe(formResult => {
      if (formResult && this.userId) {
        if (!formResult.nature_heure || !formResult.heureDebut || !formResult.heureFin || !formResult.date) {
          this.toastr.error('Champs requis manquants : nature, heure de début, heure de fin ou date.', 'Erreur');
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
                if (this.userRole === 'EMPLOYEE') {
                  this.toastr.success(`Demande de  modification pour "${formResult.nature_heure}" envoyée avec succès.`, 'Succès');}else {
                  this.toastr.success(`Nature d’heure "${formResult.nature_heure}" modifiée avec succès.`, 'Succès');
                }
                this.journeeService.getNatureHeures(this.userId!)
                  .subscribe({
                    next: (value) => {
                      this.natureHeures = this.filterByDate(value, this.selectedDate, nh => nh.nature_heure?.toLowerCase() === 'déjeuner');
                      this.cdr.detectChanges();
                      if (this.sectionVisibility['section5'] && this.timeline) {
                        setTimeout(() => {
                          if (this.timeline) {
                            this.updateTimeline();
                          } else {
                            this.initializeTimeline();
                          }
                        }, 350);
                      }
                    },
                    error: (error) => {
                      this.toastr.error('Erreur lors de la récupération des natures d’heures.', 'Erreur');
                    }
                  });
              },
              error: (error) => {
                this.toastr.error(`Erreur lors de la modification de la nature d’heure "${formResult.nature_heure}".`, 'Erreur');
              }
            });
          }
        });
      }
    });
  }

  deleteItem(natureHeure: NatureHeure): void {
    if (!natureHeure.id || !this.userId) {
      this.toastr.error('ID de nature d’heure ou d’utilisateur invalide.', 'Erreur');
      return;
    }
    const message = this.userRole === 'MANAGER'
      ? `Voulez-vous vraiment supprimer la nature d'heure "${natureHeure.nature_heure}" ?`
      : `Voulez-vous soumettre une demande de suppression pour la nature d'heure "${natureHeure.nature_heure}" ?`;
    const dialogRef = this.dialog.open(PopupConfMaladieComponent, {
      data: { message }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.userId) {
        if (this.userRole === 'MANAGER') {
          this.journeeService.deleteNatureHeure(natureHeure.id!, this.userId).subscribe({
            next: (response) => {
              if (this.userRole === 'MANAGER') {
              this.toastr.success(`Nature d’heure "${natureHeure.nature_heure}" supprimée avec succès.`, 'Succès');}
              this.journeeService.getNatureHeures(this.userId!)
                .subscribe({
                  next: (value) => {
                    this.allNatureHeures = value;
                    this.filteredNatureHeures = [...value];
                    this.updateNatureHeuresPagination();
                    this.cdr.detectChanges();
                    if (this.sectionVisibility['section5'] && this.timeline) {
                      setTimeout(() => {
                        if (this.timeline) {
                          this.updateTimeline();
                        } else {
                          this.initializeTimeline();
                        }
                      }, 350);
                    }
                  },
                  error: (error) => {
                    this.toastr.error('Erreur lors de la récupération des natures d’heures.', 'Erreur');
                  }
                });
            },
            error: (error) => {
              this.toastr.error(`Erreur lors de la suppression de la nature d’heure "${natureHeure.nature_heure}".`, 'Erreur');
            }
          });
        } else {
          this.journeeService.requestNatureHeureDeletion(natureHeure.id!, this.userId).subscribe({
            next: (response) => {
              this.toastr.success(`Demande de suppression pour "${natureHeure.nature_heure}" soumise avec succès.`, 'Succès');
              this.cdr.detectChanges();
            },
            error: (error) => {
              this.toastr.error(`Erreur lors de la soumission de la demande de suppression pour "${natureHeure.nature_heure}".`, 'Erreur');
            }
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

  openDetailRequest(request: NatureHeureRequest): void {
    this.dialog.open(PopupNatureHeureComponent, {
      data: { type: 'detail', item: request }
    });
  }

  openDetailModificationRequest(request: NatureHeureModificationRequest): void {
    this.dialog.open(PopupNatureHeureComponent, {
      data: { type: 'detail', item: {
          nature_heure: request.newNatureHeure,
          date: request.newDate,
          heureDebut: request.newHeureDebut,
          heureFin: request.newHeureFin,
          duree: request.newDuree,
          commentaire: request.newCommentaire,
          requestedAt: request.requestedAt
        }}
    });
  }

  openDetailDeletionRequest(request: NatureHeureDeletionRequest): void {
    this.dialog.open(PopupNatureHeureComponent, {
      data: { type: 'detail', item: {
          nature_heure: request.originalNatureHeure?.nature_heure || 'N/A',
          date: request.originalNatureHeure?.date,
          heureDebut: request.originalNatureHeure?.heureDebut,
          heureFin: request.originalNatureHeure?.heureFin,
          duree: request.originalNatureHeure?.duree,
          requestedAt: request.requestedAt
        }}
    });
  }
}
