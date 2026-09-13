import { vi } from 'vitest';

process.env.TEST_MODE = 'true';

vi.mock('pdf-parse', () => ({
  default: vi.fn().mockImplementation(async (buffer: Buffer) => {
    return { text: buffer.toString() };
  }),
}));
