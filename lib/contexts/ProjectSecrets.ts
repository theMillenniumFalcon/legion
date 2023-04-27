import { createContext } from 'react';

const ProjectSecrets = createContext<Pick<any, 'name'>[]>([]);

export default ProjectSecrets;
