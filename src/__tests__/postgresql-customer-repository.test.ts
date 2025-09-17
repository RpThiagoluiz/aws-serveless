import { PostgreSQLCustomerRepository } from '../infrastructure/repositories/postgresql-customer.repository';
import { Customer } from '../domain/entities/customer.entity';
import { Pool } from 'pg';
import { describe, beforeEach, afterEach, it } from 'node:test';

// Mock do pg
jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

describe('PostgreSQLCustomerRepository', () => {
  let repository: PostgreSQLCustomerRepository;
  let mockPool: any;
  let mockClient: any;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockClient = {
      query: mockQuery,
      release: jest.fn(),
    };

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
      query: mockQuery,
    };

    (Pool as unknown as jest.Mock).mockImplementation(() => mockPool);

    repository = new PostgreSQLCustomerRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByCpf', () => {
    it('should return customer when found', async () => {
      // Arrange
      const cpf = '12345678901';
      const mockResult = {
        rows: [
          {
            id: '123',
            cpf: '12345678901',
            name: 'João Silva',
            email: 'joao@email.com',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
        ],
      };
      mockQuery.mockResolvedValue(mockResult);

      // Act
      const result = await repository.findByCpf(cpf);

      // Assert
      expect(result).toBeInstanceOf(Customer);
      expect(result?.id).toBe('123');
      expect(result?.cpf).toBe('12345678901');
      expect(result?.name).toBe('João Silva');
      expect(result?.email).toBe('joao@email.com');
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, cpf, name, email, created_at, updated_at FROM customers WHERE cpf = $1',
        [cpf]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return null when customer not found', async () => {
      // Arrange
      const cpf = '12345678901';
      const mockResult = { rows: [] };
      mockQuery.mockResolvedValue(mockResult);

      // Act
      const result = await repository.findByCpf(cpf);

      // Assert
      expect(result).toBeNull();
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, cpf, name, email, created_at, updated_at FROM customers WHERE cpf = $1',
        [cpf]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      const cpf = '12345678901';
      mockQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(repository.findByCpf(cpf)).rejects.toThrow('Database error');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
