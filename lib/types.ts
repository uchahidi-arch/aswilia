// ════════════════════════════════════════════════════════════════
//  ASWILIA — Types TypeScript
//  Générés à partir de l'analyse de index.html (v9.0)
// ════════════════════════════════════════════════════════════════

// ─── ENUMS ──────────────────────────────────────────────────────

export type Genre = 'M' | 'F'

export type IleComores = 'Grande Comore (Ngazidja)' | 'Anjouan (Ndzwani)' | 'Mohéli (Mwali)' | 'Mayotte (Maore)'

export type NotificationType =
  | 'link_request'
  | 'fusion_request'
  | 'info'
  | string

// ─── TABLES SUPABASE ────────────────────────────────────────────

export interface Profile {
  id: string                  // uuid — correspond à auth.users.id
  prenom: string
  nom?: string | null
  ile?: IleComores | null
  username?: string | null
  role?: 'user' | 'redacteur' | 'admin' | null
  cgu_accepted?: boolean | null
  cgu_accepted_at?: string | null
  created_at?: string | null
}

export interface Person {
  id: string                  // uuid
  owner_id: string            // uuid — référence profiles.id
  created_by: string          // uuid
  created_by_name?: string | null

  // Identité
  prenom: string
  nom: string
  genre: Genre
  deceased: boolean

  // Lignée comorienne
  prefix_lignee?: string | null  // ex: "Binti", "Mze"
  clan?: string | null            // Hinya / clan
  daho?: string | null            // surnom/daho
  ile?: IleComores | null
  localite?: string | null
  naiss_lieu?: string | null

  // Dates
  naiss_date?: string | null
  deces_date?: string | null

  // Extras
  metier?: string | null
  notes?: string | null
  photo_url?: string | null

  // Visibilité dans le registre public
  masque?: boolean | null        // true = caché dans le registre (vivants seulement)

  // Lien vers une personne publique (anti-doublon)
  external_ref?: string | null   // uuid — références persons.id

  // Timestamps
  created_at?: string | null
  updated_at?: string | null
}

export interface Union {
  id: string                  // uuid
  owner_id: string            // uuid
  created_by: string          // uuid
  created_by_name?: string | null

  pere_id?: string | null     // uuid — référence persons.id
  mere_id?: string | null     // uuid — référence persons.id
  enfants_ids: string[]       // uuid[]

  created_at?: string | null
  updated_at?: string | null
}

export interface Notification {
  id: string                  // uuid
  user_id: string             // uuid — référence profiles.id
  type: NotificationType
  title: string
  body?: string | null
  data?: Record<string, unknown>
  read: boolean
  created_at?: string | null
}

// ─── TYPE DATABASE (pour createBrowserClient<Database>) ─────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      persons: {
        Row: Person
        Insert: Omit<Person, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Person, 'id' | 'owner_id' | 'created_by' | 'created_at'>>
      }
      unions: {
        Row: Union
        Insert: Omit<Union, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Union, 'id' | 'owner_id' | 'created_by' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Pick<Notification, 'read'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ─── STATE GLOBAL (miroir du STATE vanilla JS) ──────────────────
// Utilisé par le Context / Zustand store

export interface RegState {
  step: 'iles' | 'regions' | 'localites' | 'clans' | 'persons'
  ile: IleComores | null
  region: string | null
  localite: string | null
  clan: string | null
  personId: string | null
  searchResults: Person[] | null
}

export interface MaState {
  gf: string | null           // genre filter
  hf: string | null           // heritage filter
  activePid: string | null    // personne active dans l'arbre
  activeUid: string | null    // union active
  aliveOnly: boolean
  searchQ: string
  bulkMode: boolean
  selectedIds: string[]
}

export interface AppState {
  user: import('@supabase/supabase-js').User | null
  profile: Profile | null
  allPersons: Person[]
  allUnions: Union[]
  myPersons: Person[]
  myUnions: Union[]
  notifications: Notification[]
  realtimeChannel: unknown | null
  reg: RegState
  ma: MaState
}

// ─── HELPERS TYPES ───────────────────────────────────────────────

/** Champs nécessaires pour créer/modifier une personne via le formulaire */
export type PersonFormData = Pick<
  Person,
  | 'prenom'
  | 'nom'
  | 'genre'
  | 'deceased'
  | 'prefix_lignee'
  | 'clan'
  | 'daho'
  | 'localite'
  | 'ile'
  | 'naiss_lieu'
  | 'naiss_date'
  | 'deces_date'
  | 'metier'
  | 'notes'
>

/** Champs pour créer/modifier une union */
export type UnionFormData = {
  pere_id: string | null
  mere_id: string | null
  enfants_ids: string[]
}

/** Données de propagation matrilinéaire */
export interface Heritage {
  clan?: string | null
  ile?: IleComores | null
  localite?: string | null
  daho?: string | null
}

/** Initialisation du STATE par défaut */
export const DEFAULT_REG_STATE: RegState = {
  step: 'iles',
  ile: null,
  region: null,
  localite: null,
  clan: null,
  personId: null,
  searchResults: null,
}

export const DEFAULT_MA_STATE: MaState = {
  gf: null,
  hf: null,
  activePid: null,
  activeUid: null,
  aliveOnly: false,
  searchQ: '',
  bulkMode: false,
  selectedIds: [],
}

export const DEFAULT_APP_STATE: Omit<AppState, 'realtimeChannel'> = {
  user: null,
  profile: null,
  allPersons: [],
  allUnions: [],
  myPersons: [],
  myUnions: [],
  notifications: [],
  reg: DEFAULT_REG_STATE,
  ma: DEFAULT_MA_STATE,
}
