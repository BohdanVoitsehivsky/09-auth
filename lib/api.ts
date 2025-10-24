import axios from 'axios';
import type { Note, CreateNoteRequest } from '@/types/note';

const BASE_URL = 'https://notehub-public.goit.study/api';
const TOKEN = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

export const fetchNotes = async ({
  page = 1,
  perPage = 12,
  search,
  tag,
}: FetchNotesParams = {}): Promise<FetchNotesResponse> => {
  const params: Record<string, string | number> = {
    page,
    perPage,
  };

  if (search && search.trim()) {
    params.search = search;
  }

  if (tag && tag !== 'All') {
    params.tag = tag;
  }

  const response = await api.get<FetchNotesResponse>('/notes', {
    params,
  });

  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response = await api.get<Note>(`/notes/${id}`);
  return response.data;
};

export const createNote = async (
  noteData: CreateNoteRequest
): Promise<Note> => {
  const response = await api.post<Note>(
    '/notes',
    noteData
  );

  return response.data;
};

export const updateNote = async (
  id: string,
  noteData: CreateNoteRequest
): Promise<Note> => {
  const response = await api.patch<Note>(
    `/notes/${id}`,
    noteData
  );

  return response.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response = await api.delete<Note>(
    `/notes/${id}`
  );

  return response.data;
};