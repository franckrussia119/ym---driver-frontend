import { api } from './api';
import { UserProfile, UserRole } from '../types';

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  camionAssigne?: string;
  habiliteMatieresDangereuses?: boolean;
  createdAt?: string;
}

export async function listUsers(): Promise<BackendUser[]> {
  return api.get<BackendUser[]>('/api/users');
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  camionAssigne?: string;
  habiliteMatieresDangereuses?: boolean;
}

export async function createUser(input: CreateUserInput): Promise<BackendUser> {
  return api.post<BackendUser>('/api/users', input);
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  camionAssigne?: string | null;
  habiliteMatieresDangereuses?: boolean;
  isActive?: boolean;
  password?: string;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<BackendUser> {
  return api.patch<BackendUser>(`/api/users/${id}`, input);
}
