
export enum UserRole {
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
  CLIENT = 'CLIENT'
}

export enum CaseStatus {
  ACTIVE = 'نشط',
  PENDING = 'قيد الانتظار',
  CLOSED = 'مغلق',
  APPEAL = 'استئناف',
  JUDGMENT = 'حكم',
  LITIGATION = 'مرافعة'
}

export enum CourtType {
  DUBAI = 'محاكم دبي',
  ADJD = 'محاكم أبوظبي',
  FEDERAL = 'المحاكم الاتحادية',
  DIFC = 'محاكم مركز دبي المالي العالمي',
  SHARIAH = 'المحاكم الشرعية'
}

export interface CaseDocument {
  id: string;
  name: string;
  type: string;
  // MIME type (e.g. application/pdf, image/png). Optional for backward compatibility.
  mimeType?: string;
  // Optional classification to make client document libraries easier to manage.
  category?: string;
  uploadDate: string;
  /**
   * Stored payload for the document.
   * Recommended: a Data URL (e.g. data:application/pdf;base64,....)
   * Backward compatible: may be empty for older records.
   */
  content?: string;
  status?: 'Signed' | 'Draft';
  description?: string;
  reviewReminder?: string;
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  // Optional dynamic type (configured from Settings).
  caseType?: string;
  clientId: string;
  clientName: string;
  opponentName: string;
  court: CourtType;
  status: CaseStatus;
  nextHearingDate: string;
  assignedLawyer: string;
  createdAt: string;
  documents: CaseDocument[];
  totalFee: number;
  paidAmount: number;
  reminderPreferences?: {
    sevenDays: boolean;
    oneDay: boolean;
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string;
  caseTitle: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Unpaid' | 'Partial';
  description: string;

  // Optional advanced invoicing fields (backward compatible)
  discountValue?: number;
  discountType?: 'percent' | 'fixed';
  finalAmount?: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  status: 'Paid' | 'Pending';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  emiratesId: string;
  address?: string;
  platformAccount?: string;
  dateOfBirth?: string;
  profileImage?: string;
  type: 'Individual' | 'Corporate';
  totalCases: number;
  createdAt: string;
  notes?: string;
  tags?: string[];
  documents?: CaseDocument[];
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price?: number;
}

// Invoice templates (used in Settings to create reusable billing descriptions)
export interface InvoiceTemplate {
  id: string;
  title: string;
  content: string;
}

// Dynamic case types configured from Settings
export interface CaseTypeConfig {
  id: string;
  name: string;
}

// New Interface for System Logs
export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string; // e.g., "Login", "Update Settings", "Export Backup"
  role: string;
}

// Enhanced System Config
export interface SystemConfig {
  officeName: string;
  officeSlogan: string;

  // Optional contact fields to appear on PDFs / reports
  officePhone?: string;
  officeEmail?: string;
  officeAddress?: string;
  officeWebsite?: string;

  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string; // New: App Background Color
  fontFamily: string;      // New: App Font Family
  logo: string | null;
  stamp: string | null;
  services: ServiceItem[];

  // Dynamic lists (safe defaults are applied in App.tsx)
  caseTypes?: CaseTypeConfig[];
  invoiceTemplates?: InvoiceTemplate[];

  /**
   * Smart templates used across WhatsApp messages and PDF/print outputs.
   * Token placeholders supported (examples):
   * {officeName} {clientName} {caseNumber} {caseTitle} {invoiceNumber} {amount} {due} {date}
   */
  smartTemplates?: {
    whatsappInvoice: string;
    whatsappPaymentReminder: string;
    whatsappSessionReminder: string;
    whatsappGeneral: string;
    invoiceLineNote: string;
    invoiceFooter: string;
    receiptFooter: string;
  };

  officeTemplates: CaseDocument[];
  invoiceFormatting: {
    prefix: string;
    suffix: string;
    nextSequence: number;
  };
  // Feature Flags for modular control
  features: {
    enableAI: boolean;
    enableAnalysis: boolean;
    enableWhatsApp: boolean;
  };
}
