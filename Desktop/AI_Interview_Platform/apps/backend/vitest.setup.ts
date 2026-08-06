import { vi } from 'vitest';

vi.mock('pdf-parse', () => ({
  default: vi.fn().mockImplementation(async (buffer: Buffer) => {
    return { text: buffer.toString() };
  }),
}));
