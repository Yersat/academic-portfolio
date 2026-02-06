
export interface Book {
  id: string;
  title: string;
  year: string;
  publisher: string;
  isbn: string;
  coverImage: string;
  description: string;
  abstract: string;
  toc?: string[];
  purchaseLinks: { label: string; url: string }[];
  status: 'published' | 'draft';

  // New fields for purchase functionality
  litresUrl?: string;
  pdfPrice?: number;
  pdfCurrency?: 'KZT' | 'RUB';
  pdfFilePath?: string;
  isPublished?: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  date: string;
  type: 'Lecture' | 'Interview' | 'Conference' | 'Talk';
  description: string;
  videoUrl?: string; // YouTube ID or URL
  tags: string[];
  status: 'published' | 'draft';
}

export interface ResearchPaper {
  id: string;
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

export interface SiteData {
  profile: Profile;
  books: Book[];
  media: MediaItem[];
  research: ResearchPaper[];
}

// API response types
export interface CheckoutResponse {
  redirectUrl: string;
  orderId: string;
  message: string;
}

export interface ApiError {
  error: string;
  message?: string;
}
