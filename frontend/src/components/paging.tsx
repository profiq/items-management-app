import type { NavigateOptions, URLSearchParamsInit } from 'react-router';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { Dispatch, SetStateAction } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';

export type PagingProps = {
  currentPage: number;
  setSearchParams: (
    nextInit?:
      | URLSearchParamsInit
      | ((prev: URLSearchParams) => URLSearchParamsInit)
      | undefined,
    navigateOpts?: NavigateOptions
  ) => void;
  maxPage: number;
  setMaxPerPage: Dispatch<SetStateAction<number>>;
  buttonCount?: number;
};

export default function Paging({
  currentPage,
  setSearchParams,
  maxPage,
  setMaxPerPage,
  buttonCount = 5,
}: PagingProps) {
  const start = Math.max(1, currentPage - Math.floor(buttonCount / 2));
  const end = Math.min(
    start + buttonCount,
    Math.min(Math.floor(buttonCount / 2) + currentPage, maxPage)
  );
  return (
    <div className='flex items-center gap-4 mt-3'>
      <Field orientation='horizontal' className='w-fit mr-auto'>
        <FieldLabel htmlFor='select-rows-per-page'>Rows per page</FieldLabel>
        <Select
          defaultValue='25'
          onValueChange={value => setMaxPerPage(parseInt(value))}
        >
          <SelectTrigger id='select-rows-per-page' className='cursor-pointer'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align='start'>
            <SelectGroup>
              <SelectItem value='10' className='cursor-pointer'>
                10
              </SelectItem>
              <SelectItem value='25' className='cursor-pointer'>
                25
              </SelectItem>
              <SelectItem value='50' className='cursor-pointer'>
                50
              </SelectItem>
              <SelectItem value='100' className='cursor-pointer'>
                100
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Pagination className='mx-0 w-auto absolute left-1/2 -translate-x-1/2'>
        <PaginationContent>
          <PaginationItem
            className={currentPage > 1 ? 'cursor-pointer' : 'cursor-default'}
          >
            <PaginationPrevious
              onClick={() => {
                if (currentPage <= 1) {
                  return;
                }
                setSearchParams({ page: (currentPage - 1).toString() });
              }}
            />
          </PaginationItem>
          {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
            num => (
              <PaginationItem key={num} className='cursor-pointer'>
                <PaginationLink
                  onClick={() => setSearchParams({ page: num.toString() })}
                  isActive={num == currentPage}
                >
                  {num}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem
            className={
              currentPage < maxPage ? 'cursor-pointer' : 'cursor-default'
            }
          >
            <PaginationNext
              onClick={() => {
                if (currentPage >= maxPage) {
                  return;
                }
                setSearchParams({ page: (currentPage + 1).toString() });
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
