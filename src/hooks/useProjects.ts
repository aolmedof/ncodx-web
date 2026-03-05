import { useState } from 'react';
import { mockProjects } from '@/lib/mock-data';
import type { Project } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'taskCount' | 'completedTaskCount' | 'members'>) => {
    const newProject: Project = {
      ...project,
      id: `p${Date.now()}`,
      taskCount: 0,
      completedTaskCount: 0,
      members: ['demo@ncodx.com'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return { projects, addProject, deleteProject };
}
