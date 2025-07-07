
export interface DossierModel {
  dateRecrutement: string;
  codeSociete: string;
  etablissement: string;
  matriculeSalarie: string;
  departementId: string;
  renseignementsIndividuels: RenseignementsIndividuels;
  adresses: Adresses[];
  affectations: Affectations[];
  carriere: Carriere[];
}

export interface RenseignementsIndividuels {
  qualite: string;
  nomUsuel: string;
  nomPatronymique: string;
  prenom: string;
  deuxiemePrenom: string;
  sexe: string;
  numeroInsee: string;
  dateNaissance: string;
  villeNaissance: string;
  paysNaissance: string;
  nationalites: Nationalite[];
  etatFamilial: string;
  dateEffet: string;
}

export interface Nationalite {
  pays: string;
  natPrincipale: boolean;
}

export interface Adresses {
  pays: string;
  typeAdresse: string;
  adressePrincipale: boolean;
  valableDu: string;
  valableAu: string;
  numeroVoie: string;
  natureVoie: string;
  complement1: string;
  complement2: string;
  lieuDit: string;
  codePostal: string;
  commune: string;
  codeInseeCommune: string;
}

export interface Affectations {
  categorieEntree: string;
  motifEntree: string;
  poste: string;
  emploi: string;
  uniteOrganisationnelle: string;
  calendrierPaie: string;
  codeCycle: string;
  indexe: boolean;
  modaliteGestion: string;
}

export interface Carriere {
  conventionCollective: string;
  accordEntreprise: string;
  qualification: string;
  typePaie: string;
  regimeSpecial: string;
  natureContrat: string;
  typeContrat: string;
  duree: string;
  dateFinPrevue: string;
  dateDebutEssai: string;
  dateFinEssai: string;
  typeTemps: string;
  modaliteHoraire: string;
  forfaitJours: boolean;
  forfaitHeures: number;
  surcotisation: string;
  heuresTravaillees: string;
  heuresPayees: string;
  dateDebutApprentissage: string;
}
