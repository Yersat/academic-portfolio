// Legacy type interfaces — prefer using Doc<"tableName"> from convex/_generated/dataModel
// These are kept as lightweight reference types for components that don't directly import Convex types.

export interface Book {
  _id: string;
  title: string;
  year: string;
  publisher: string;
  isbn: string;
  coverImage: string;
  description: string;
  abstract: string;
  toc?: string[];
  status: 'published' | 'draft';
  litresUrl?: string;
  pdfPrice?: number;
  pdfCurrency?: 'KZT' | 'RUB';
  pdfStorageId?: string;
  isPublished: boolean;
}

export interface MediaItem {
  _id: string;
  title: string;
  date: string;
  type: 'Lecture' | 'Interview' | 'Conference' | 'Talk';
  description: string;
  videoUrl?: string;
  tags: string[];
  status: 'published' | 'draft';
}

export interface ResearchPaper {
  _id: string;
  title: string;
  year: string;
  journal?: string;
  authors: string;
  pdfUrl?: string;
  abstract: string;
  status: 'published' | 'draft';
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  extendedBio: string;
  researchInterests: string[];
  university: string;
  email: string;
  location: string;
  cvUrl: string;
}
