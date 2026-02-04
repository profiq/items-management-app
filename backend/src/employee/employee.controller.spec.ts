import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { IEmployee } from './interfaces/employee.interface';

describe('EmployeeController', () => {
  let employeeController: EmployeeController;
  let employeeService: EmployeeService;

  beforeEach(() => {
    employeeService = new EmployeeService();
    employeeController = new EmployeeController(employeeService);
  });

  describe('getEmployees', () => {
    it('should return object key employee after resolving', async () => {
      const result: IEmployee[] = [
        {
          id: '1',
          email: 'test@example.com',
          name: 'Tester Tester',
          photoUrl: 'http://example.com/photo.png',
        },
      ];
      jest
        .spyOn(employeeService, 'getEmployees')
        .mockImplementation(() => Promise.resolve(result));

      expect.assertions(1);

      await expect(employeeController.getEmployees()).resolves.toBe(result);
    });
  });
});
