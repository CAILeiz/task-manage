import { IApiResponse, IPaginationResponse } from '../models/types';

export function successResponse<T>(data: T, message: string = 'Success'): IApiResponse<T> {
  return {
    code: 0,
    data,
    message,
  };
}

export function errorResponse(message: string, code: number = 1): IApiResponse<null> {
  return {
    code,
    data: null,
    message,
  };
}

export function paginationResponse<T>(
  list: T[],
  total: number,
  page: number,
  limit: number
): IApiResponse<IPaginationResponse<T>> {
  const totalPages = Math.ceil(total / limit);
  return successResponse({
    list,
    total,
    page,
    limit,
    totalPages,
  });
}

export default {
  successResponse,
  errorResponse,
  paginationResponse,
};
