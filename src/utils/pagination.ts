import { PaginationOptions, PaginationQuery } from '../types/common';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from './constants';

export function parsePaginationQuery(query: PaginationQuery): PaginationOptions {
  let page = parseInt(String(query.page)) || DEFAULT_PAGE;
  let limit = parseInt(String(query.limit)) || DEFAULT_LIMIT;

  // Validation
  if (page < 1) page = DEFAULT_PAGE;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { page, limit };
}

export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function paginateArray<T>(array: T[], page: number, limit: number): T[] {
  const offset = calculateOffset(page, limit);
  return array.slice(offset, offset + limit);
}
