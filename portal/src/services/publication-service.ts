import { api } from '@/lib/api';

export interface Collaboration {
  id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  myRole?: 'owner' | 'editor' | 'viewer';
  owner?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    username: string;
  };
  members?: CollaborationMember[];
  articles?: any[]; // Replace with Article type
}

export interface CollaborationMember {
  id: number;
  collaborationId: number;
  userId: number;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    username: string;
  };
}

export const publicationService = {
  // Collaborations
  getCollaborations: async () => {
    const response = await api.get('/publication/author/collaborations');
    return response.data.data;
  },

  getCollaborationById: async (id: number) => {
    const response = await api.get(`/publication/author/collaborations/${id}`);
    return response.data.data;
  },

  createCollaboration: async (data: { title: string; description?: string }) => {
    const response = await api.post('/publication/author/collaborations', data);
    return response.data;
  },

  updateCollaboration: async (id: number, data: { title?: string; description?: string; status?: 'active' | 'completed' | 'archived' }) => {
    const response = await api.put(`/publication/author/collaborations/${id}`, data);
    return response.data;
  },

  deleteCollaboration: async (id: number) => {
    const response = await api.delete(`/publication/author/collaborations/${id}`);
    return response.data;
  },

  addMember: async (collaborationId: number, data: { userId: number; role: 'editor' | 'viewer' }) => {
    const response = await api.post(`/publication/author/collaborations/${collaborationId}/members`, data);
    return response.data;
  },

  removeMember: async (collaborationId: number, memberId: number) => {
    const response = await api.delete(`/publication/author/collaborations/${collaborationId}/members/${memberId}`);
    return response.data;
  },
  
  // Articles (Simplified for now)
  getArticles: async () => {
      const response = await api.get('/publication/articles');
      return response.data.data;
  }
};
