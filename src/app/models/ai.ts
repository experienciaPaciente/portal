export interface IA {
  // Metadata del proceso
  processedAt?: Date;
  model?: string;
  confidence?: number;

  // Análisis del texto
  summary?: string;
  sentiment?: 'positivo' | 'neutral' | 'negativo';

  // Extracción clínica
  symptoms?: string[];
  conditions?: string[];
  medications?: string[];
  medicationChange?: boolean;
  vitalSignsMentioned?: string[];

  // Extracción experiencial
  emotions?: string[];
  anxietyDetected?: boolean;
  frustrationDetected?: boolean;

  // Contexto del sistema de salud
  administrativeIssues?: string[];
  orientationIssues?: string[];
  followupMentions?: string[];
  preventiveCareGaps?: string[];

  // Metadata semántica
  tags?: string[];
  effortRelated?: boolean;
  severity?: 'leve' | 'media' | 'alta' | 'desconocida';
}