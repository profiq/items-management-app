import { getEmployeesFromApi } from '@/lib/apiCommunication';
import { StatusCodes } from 'http-status-codes';

export async function getEmployees() {
  const result = await getEmployeesFromApi();
  if (result.status_code != StatusCodes.OK) {
    return Promise.reject(`Could not fetch the data! An error occured`);
  }
  return result.data;
}
