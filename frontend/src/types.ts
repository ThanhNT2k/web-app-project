export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: 'Admin' | 'Uploader' | 'User' | 'Guest' | string;
  bio?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Story {
  id: number;
  title: string;
  slug: string;
  author_id: number;
  description?: string | null;
  cover_image_url?: string | null;
  category?: string | null;
  status?: 'Ongoing' | 'Completed' | 'Hiatus' | string;
  total_chapters?: number;
  created_at?: string;
  updated_at?: string;
  is_published?: boolean;
  chapter_count?: number;
  author_user_id?: number;
  author_username?: string;
  author_full_name?: string;
  author_avatar_url?: string | null;
}

export interface Chapter {
  id: number;
  story_id: number;
  chapter_number: number;
  title?: string | null;
  content?: string | null;
  created_at?: string;
  updated_at?: string;
  is_published?: boolean;
  story_id_ref?: number;
  story_title?: string;
  story_slug?: string;
  story_description?: string | null;
  story_cover_image_url?: string | null;
  story_category?: string | null;
  story_status?: string | null;
  story_total_chapters?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  message?: string;
  stories?: T[];
  chapters?: T[];
  story?: T;
  chapter?: Chapter;
  user?: User;
  token?: string;
  pagination?: Pagination;
  errors?: string[];
}