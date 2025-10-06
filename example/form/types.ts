import type * as z from 'zod';
import type { schema } from './utils.js';

export type Schema = z.infer<typeof schema>;
