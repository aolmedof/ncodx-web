import { useState } from 'react';
import { mockTasks } from '@/lib/mock-data';
import type { Task, TaskStatus } from '@/types';

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const filtered = projectId ? tasks.filter((t) => t.projectId === projectId) : tasks;

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks: filtered, allTasks: tasks, addTask, updateTaskStatus, deleteTask };
}
