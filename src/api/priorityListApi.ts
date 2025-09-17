// src/api/priorityListApi.ts
import { api } from '../api';
import type {
  PriorityListPageDto,
  ImportStatusDto,
  TargetDateUpdateRequestDto,
  TargetDateUpdateResponseDto,
  DbrResponseDto
} from '../types/priorityList';

interface FetchPriorityListParams {
  resource?: string;
  resources?: string[];
  nonScheduled?: boolean;
  page?: number;
  pageSize?: number;
}

export const priorityListApi = {
  async fetchPriorityList(params: FetchPriorityListParams): Promise<PriorityListPageDto> {
    const searchParams = new URLSearchParams();

    // Handle single resource (backward compatibility)
    if (params.resource) {
      searchParams.set('resource', params.resource);
    }

    // Handle multiple resources
    if (params.resources && params.resources.length > 0) {
      params.resources.forEach(resource => {
        searchParams.append('resources', resource);
      });
    }

    if (params.nonScheduled) {
      searchParams.set('nonScheduled', '1');
    }

    searchParams.set('page', String(params.page ?? 1));
    searchParams.set('pageSize', String(params.pageSize ?? 50));

    const response = await api.get<PriorityListPageDto>(`/api/v1/priority-list?${searchParams.toString()}`);
    return response.data;
  },

  async patchTargetDates(updates: { productionOrderNr: string; targetDate: string | null }[]): Promise<TargetDateUpdateResponseDto> {
    const requestBody: TargetDateUpdateRequestDto = { updates };

    const response = await api.patch<TargetDateUpdateResponseDto>('/api/v1/priority-list/target-dates', requestBody);
    return response.data;
  },

  async getImportStatus(): Promise<ImportStatusDto> {
    const response = await api.get<ImportStatusDto>('/api/v1/import-status');
    return response.data;
  },

  async runDbr(operation: 'reset' | 'run'): Promise<DbrResponseDto> {
    const response = await api.post<DbrResponseDto>(`/api/v1/dbr/${operation}`);
    return response.data;
  }
};