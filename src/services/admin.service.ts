import { ApiResponse } from '../lib/api-client';

export interface Building {
  id: string;
  name: string;
  code: string;
  floors: number;
  branch: string;
}

export const useAdminService = (api: any) => {
  return {
    /**
     * Fetch all buildings
     */
    getBuildings: async (): Promise<ApiResponse<Building[]>> => {
      return await api.get('/admin/buildings');
    },

    /**
     * Create a new building
     */
    createBuilding: async (data: Omit<Building, 'id'>): Promise<ApiResponse<Building>> => {
      return await api.post('/admin/buildings', data);
    },

    /**
     * Update an existing building
     */
    updateBuilding: async (id: string, data: Partial<Building>): Promise<ApiResponse<Building>> => {
      return await api.patch(`/admin/buildings/${id}`, data);
    },

    /**
     * Delete a building
     */
    deleteBuilding: async (id: string): Promise<ApiResponse<void>> => {
      return await api.delete(`/admin/buildings/${id}`);
    },

    /**
     * Fetch elections (admin/manager view)
     */
    getElections: async (params: {
      status?: 'active' | 'upcoming' | 'past' | 'all';
      category?: string;
      q?: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<{ elections: any[]; total: number }>> => {
      return await api.get('/elections', { params });
    },

    /**
     * Fetch election results
     */
    getElectionResults: async (id: string): Promise<ApiResponse<any>> => {
      return await api.get(`/elections/${id}/results`);
    },

    /**
     * Fetch election analytics summary
     */
    getElectionAnalytics: async (): Promise<ApiResponse<any>> => {
      return await api.get('/elections/analytics');
    },

    /**
     * Create a new election
     */
    createElection: async (data: any): Promise<ApiResponse<any>> => {
      return await api.post('/elections', data);
    },

    /**
     * Fetch all university branches
     */
    getBranches: async (): Promise<ApiResponse<any[]>> => {
      return await api.get('/directory/branches');
    },

    /**
     * Fetch metadata (enums) for forms
     */
    getMetadata: async (): Promise<ApiResponse<any>> => {
      return await api.get('/config/metadata');
    },

    /**
     * Fetch departments (optional branchId filter)
     */
    getDepartments: async (branchId?: string): Promise<ApiResponse<any[]>> => {
      return await api.get('/directory/departments', { params: { branchId } });
    },

    /**
     * Fetch a paginated list of users for the directory (admin only)
     */
    getUsers: async (params: { q?: string; page?: number; limit?: number }): Promise<ApiResponse<any[]>> => {
      return await api.get('/admin/users', { params });
    },

    /**
     * Example of handling file uploads (Multipart/form-data)
     */
    uploadMedia: async (file: File): Promise<ApiResponse<{ url: string }>> => {
      const formData = new FormData();
      formData.append('file', file);

      return await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  };
};
