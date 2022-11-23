import { Secret } from '@prisma/client';
import { createContext } from 'react';

export const ProjectSecrets = createContext<Pick<Secret, 'name'>[]>([])

