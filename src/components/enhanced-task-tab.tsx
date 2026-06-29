'use client';
import { useState, useEffect, useCallback } from 'react'
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Plus, Trash, Edit, Check, X, ArrowUp, ArrowDown, Search, Calendar, Tag, Paperclip, Star, Filter, ListChecks } from "lucide-react"
import { 
  ThemeName, 
  ThemeColors, 
  themes, 
  getButtonClasses,
  isNeon 
} from '@/lib/theme'
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';

interface EnhancedTaskTabProps {
  theme: ThemeName;
}

const formatIndianDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
  
type Priority = 'High' | 'Medium' | 'Low'
type Status = 'Not Started' | 'In Progress' | 'Completed'
type Category = 'Work' | 'Personal' | 'Urgent' | 'Follow Up' | 'Meeting'

interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  dueDate: string
  categories: Category[]
  starred: boolean
  notes?: string
}

export default function EnhancedTaskTab({ theme }: EnhancedTaskTabProps) {
  const { user } = useAuth();
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const TASKS_COLLECTION = 'tasks';
  const neon = isNeon(theme);
  
  const {
    bgColor,
    textColor,
    cardBg,
    borderColor,
    inputBg,
    mutedText,
    highlightBg,
    selectedBg,
    buttonBg,
    buttonHover,
    buttonText
  } = currentTheme  
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Not Started',
    dueDate: new Date().toISOString().split('T')[0],
    categories: [],
    starred: false
  });

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTaskData, setEditTaskData] = useState<Task | null>(null)
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All')
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All')
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All')
  const [sortField, setSortField] = useState<'priority' | 'status' | 'dueDate'>('priority')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'starred' | 'today' | 'overdue'>('all')
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, TASKS_COLLECTION), 
        where('userId', '==', user.uid)
      );
      
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const tasksData: Task[] = [];
          querySnapshot.forEach((doc) => {
            tasksData.push({ 
              id: doc.id, 
              ...doc.data() 
            } as Task);
          });
          setTasks(tasksData);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading tasks:', error);
          setError('Failed to load tasks. Please try again.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up task listener:', error);
      setError('Failed to initialize task data.');
      setLoading(false);
    }
  }, [user?.uid]);

  const addTaskToFirestore = async (taskData: Omit<Task, 'id'>) => {
    if (!user?.uid) throw new Error('User not authenticated');
    try {
      const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
        ...taskData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw new Error('Failed to add task');
    }
  };

  const updateTaskInFirestore = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateDoc(doc(db, TASKS_COLLECTION, taskId), updates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  };

  const deleteTaskFromFirestore = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }
    try {
      setLoading(true);
      await addTaskToFirestore({ ...newTask, userId: user?.uid || '' });
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Not Started',
        dueDate: new Date().toISOString().split('T')[0],
        categories: [],
        starred: false
      });
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };
  
  const isOverdue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  const isDueToday = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dueDate === today;
  };

  const isDueSoon = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id)
    setEditTaskData({...task})
  }

  const cancelEdit = () => {
    setEditingTaskId(null)
    setEditTaskData(null)
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTaskFromFirestore(id);
      setTasks(tasks.filter(task => task.id !== id));
      setSelectedTasks(selectedTasks.filter(taskId => taskId !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Status) => {
    try {
      await updateTaskInFirestore(taskId, { status: newStatus });
      setTasks(tasks.map(task => task.id === taskId ? {...task, status: newStatus} : task));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const toggleStar = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStarred = !task.starred;
    try {
      await updateTaskInFirestore(id, { starred: newStarred });
      setTasks(tasks.map(task => task.id === id ? {...task, starred: newStarred} : task));
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const saveEdit = async () => {
    if (!editTaskData || !editingTaskId) return;
    try {
      await updateTaskInFirestore(editingTaskId, editTaskData);
      setTasks(tasks.map(task => task.id === editingTaskId ? editTaskData : task));
      setEditingTaskId(null);
      setEditTaskData(null);
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTasks.map(id => deleteTaskFromFirestore(id)));
      setTasks(tasks.filter(task => !selectedTasks.includes(task.id)));
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error during bulk delete:', error);
    }
  };

  const handleBulkStatusChange = async (status: Status) => {
    try {
      await Promise.all(selectedTasks.map(id => updateTaskInFirestore(id, { status })));
      setTasks(tasks.map(task => selectedTasks.includes(task.id) ? {...task, status} : task));
    } catch (error) {
      console.error('Error during bulk status change:', error);
    }
  };

  const addCategory = () => {
    if (!newCategory || newTask.categories.includes(newCategory as Category)) return
    setNewTask({ ...newTask, categories: [...newTask.categories, newCategory as Category] })
    setNewCategory('')
  }

  const removeCategory = (category: Category) => {
    setNewTask({ ...newTask, categories: newTask.categories.filter(c => c !== category) })
  }

  const toggleStatus = async (id: string) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) return;
      let newStatus: Status;
      switch(taskToUpdate.status) {
        case 'Not Started': newStatus = 'In Progress'; break;
        case 'In Progress': newStatus = 'Completed'; break;
        case 'Completed': newStatus = 'Not Started'; break;
        default: newStatus = 'Not Started';
      }
      await updateTaskInFirestore(id, { status: newStatus });
      setTasks(tasks.map(task => task.id === id ? {...task, status: newStatus} : task));
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status');
    }
  };

  const toggleSelectAll = useCallback(() => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task.id));
    }
  }, [tasks, selectedTasks]);

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTasks(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  }, []);

  const deleteSelectedTasks = useCallback(async () => {
    if (selectedTasks.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(selectedTasks.map(taskId => deleteTaskFromFirestore(taskId)));
      setSelectedTasks([]);
    } catch (error) {
      setError('Failed to delete selected tasks');
    } finally {
      setLoading(false);
    }
  }, [selectedTasks]);

  const filteredTasks = tasks.filter(task => {
    const priorityMatch = filterPriority === 'All' || task.priority === filterPriority
    const statusMatch = filterStatus === 'All' || task.status === filterStatus
    const categoryMatch = filterCategory === 'All' || task.categories.includes(filterCategory)
    const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description.toLowerCase().includes(searchQuery.toLowerCase())
    let tabMatch = true
    if (activeTab === 'starred') tabMatch = task.starred
    if (activeTab === 'today') tabMatch = isDueToday(task.dueDate)
    if (activeTab === 'overdue') tabMatch = isOverdue(task.dueDate)
    return priorityMatch && statusMatch && categoryMatch && searchMatch && tabMatch
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortField === 'priority') {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 }
      return sortDirection === 'asc' ? priorityOrder[a.priority] - priorityOrder[b.priority] : priorityOrder[b.priority] - priorityOrder[a.priority]
    } else if (sortField === 'status') {
      const statusOrder = { 'Not Started': 1, 'In Progress': 2, 'Completed': 3 }
      return sortDirection === 'asc' ? statusOrder[a.status] - statusOrder[b.status] : statusOrder[b.status] - statusOrder[a.status]
    } else {
      return sortDirection === 'asc' ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    }
  })

  // Neon-aware UI helpers
  const getPriorityColor = (priority: Priority) => {
    if (neon) {
      switch (priority) {
        case 'High': return 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_8px_rgba(255,0,0,0.15)] rounded-full'
        case 'Medium': return 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_8px_rgba(251,191,36,0.15)] rounded-full'
        case 'Low': return 'bg-green-500/20 text-green-400 border border-green-500/40 shadow-[0_0_8px_rgba(74,222,128,0.15)] rounded-full'
      }
    }
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded-full'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded-full'
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full'
    }
  }

  const getStatusColor = (status: Status) => {
    if (neon) {
      switch (status) {
        case 'Not Started': return 'bg-slate-500/20 text-slate-400 border border-slate-500/40 shadow-[0_0_8px_rgba(148,163,184,0.15)] rounded-full'
        case 'In Progress': return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,255,255,0.15)] rounded-full'
        case 'Completed': return 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40 shadow-[0_0_8px_rgba(232,121,249,0.15)] rounded-full'
      }
    }
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-full'
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full'
      case 'Completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 rounded-full'
    }
  }

  const getDueDateColor = (dueDate: string) => {
    if (neon) {
      if (isOverdue(dueDate)) return 'text-red-400 font-bold drop-shadow-[0_0_4px_rgba(255,0,0,0.5)]'
      if (isDueToday(dueDate)) return 'text-cyan-400 font-bold drop-shadow-[0_0_4px_rgba(0,255,255,0.5)]'
      if (isDueSoon(dueDate)) return 'text-amber-400 font-bold drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
      return 'text-slate-400'
    }
    if (isOverdue(dueDate)) return 'text-red-700 dark:text-red-500 font-bold'
    if (isDueToday(dueDate)) return 'text-blue-700 dark:text-blue-500 font-bold'
    if (isDueSoon(dueDate)) return 'text-green-700 dark:text-green-500 font-bold'
    return 'text-gray-600 dark:text-gray-400'
  }

  const allCategories: Category[] = ['Work', 'Personal', 'Urgent', 'Follow Up', 'Meeting']
  
  const renderTasks = (filteredTasks: Task[]) => (
    <div className="space-y-4">
      {filteredTasks.map(task => (
        <Card key={task.id} className={`${cardBg} ${borderColor} rounded-xl ${neon ? 'shadow-[0_0_15px_rgba(0,255,255,0.1)] border-cyan-500/30 hover:shadow-[0_0_25px_rgba(0,255,255,0.2)] transition-shadow' : ''}`}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className={neon ? 'drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : ''}>{task.title}</span>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={() => toggleStar(task.id)} className="rounded-full">
                  {task.starred ? '⭐' : '☆'}
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleDeleteTask(task.id)} className="rounded-full">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{task.description}</p>
            <div className="flex gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
            </div>
            <p className="text-xs mt-2">Due: <span className={getDueDateColor(task.dueDate)}>{formatIndianDate(task.dueDate)}</span></p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <div className={`p-4 ${neon ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]' : ''}`}>Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className={`p-4 rounded-xl ${neon ? 'text-red-400 bg-red-500/10 border border-red-500/30 shadow-[0_0_15px_rgba(255,0,0,0.2)]' : 'text-red-500 bg-red-50'}`}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${bgColor} ${textColor}`}>
      {/* Task View Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className={`grid grid-cols-4 w-full ${cardBg} border ${borderColor} rounded-xl ${neon ? 'bg-slate-950/80 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : ''}`}>
          <TabsTrigger value="all" className={`rounded-lg ${neon ? 'data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_10px_rgba(0,255,255,0.2)]' : `data-[state=active]:${buttonBg} data-[state=active]:${buttonText}`}`}>
            All Tasks
          </TabsTrigger>
          <TabsTrigger value="starred" className={`rounded-lg ${neon ? 'data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-400 data-[state=active]:shadow-[0_0_10px_rgba(232,121,249,0.2)]' : `data-[state=active]:${buttonBg} data-[state=active]:${buttonText}`}`}>
            Starred
          </TabsTrigger>
          <TabsTrigger value="today" className={`rounded-lg ${neon ? 'data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:shadow-[0_0_10px_rgba(74,222,128,0.2)]' : `data-[state=active]:${buttonBg} data-[state=active]:${buttonText}`}`}>
            Today
          </TabsTrigger>
          <TabsTrigger value="overdue" className={`rounded-lg ${neon ? 'data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:shadow-[0_0_10px_rgba(255,0,0,0.2)]' : `data-[state=active]:${buttonBg} data-[state=active]:${buttonText}`}`}>
            Overdue
          </TabsTrigger>
        </TabsList>

         <TabsContent value="starred" className="mt-0">
          {renderTasks(tasks.filter(task => task.starred))}
        </TabsContent>

        <TabsContent value="today" className="-mt-3">
          {renderTasks(tasks.filter(task => isDueToday(task.dueDate)))}
        </TabsContent>

        <TabsContent value="overdue" className="mt-0">
          {renderTasks(tasks.filter(task => isOverdue(task.dueDate)))}
        </TabsContent>
        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {tasks.map(task => (
              <Card key={task.id} className={`p-4 shadow-md rounded-xl border ${cardBg} ${borderColor} ${textColor} ${neon ? 'shadow-[0_0_15px_rgba(0,255,255,0.1)] border-cyan-500/30 hover:shadow-[0_0_25px_rgba(0,255,255,0.2)] transition-shadow' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className={neon ? 'drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : ''}>{task.title}</span>
                    <span className={task.starred ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-yellow-500'}>{task.starred ? '⭐' : '☆'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>{task.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                  </div>
                  <p className="mt-2">
                    <span className="font-medium">Due:</span>{' '}
                    <span className={`font-semibold ${getDueDateColor(task.dueDate)}`}>{formatIndianDate(task.dueDate)}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
 
      {/* Add Task Section */}
      <Card className={`-mt-2 rounded-xl ${cardBg} ${borderColor} ${neon ? 'shadow-[0_0_20px_rgba(0,255,255,0.1)] border-cyan-500/30' : ''}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${neon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : ''}`}>
            <Plus className="h-5 w-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Task title"
                className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-shadow' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description"
                className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-shadow' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value: Priority) => setNewTask({...newTask, priority: value})}
              >
                <SelectTrigger className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400' : ''}`}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className={`rounded-xl ${cardBg} ${borderColor} ${neon ? 'bg-slate-950 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : ''}`}>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-shadow' : ''}`}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newTask.categories.map(category => (
                  <span 
                    key={category} 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${neon ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,255,255,0.15)]' : `${highlightBg} ${textColor}`}`}
                  >
                    {category}
                    <button type="button" onClick={() => removeCategory(category)} className="ml-1 rounded-full hover:bg-black/10">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className={`rounded-full ${inputBg} ${borderColor}`}>
                    <SelectValue placeholder="Add category" />
                  </SelectTrigger>
                  <SelectContent className={`rounded-xl ${cardBg} ${borderColor} ${neon ? 'bg-slate-950 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : ''}`}>
                    {allCategories.filter(cat => !newTask.categories.includes(cat)).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={addCategory}
                  className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)]' : ''}`}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <div className="flex items-center">
              <Checkbox 
                id="starred" 
                checked={newTask.starred}
                onCheckedChange={(checked) => setNewTask({...newTask, starred: !!checked})}
                className={`rounded ${neon ? 'border-cyan-500/40 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-400' : ''}`}
              />
              <Label htmlFor="starred" className="ml-2">Starred</Label>
            </div>
            <Button 
              onClick={handleAddTask} 
              className={`gap-2 rounded-full ${neon ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] transition-all' : ''}`}
              style={!neon ? { backgroundColor: buttonBg, color: buttonText } : undefined}
            >
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          </div>
        </CardContent>
      </Card>
                  {/* Controls Section */}
      <Card className={`rounded-xl ${cardBg} border ${borderColor} ${neon ? 'shadow-[0_0_20px_rgba(0,255,255,0.08)] border-cyan-500/30' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={neon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : ''}>Task Controls</CardTitle>
            {selectedTasks.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkStatusChange('Completed')}
                  className={`rounded-full ${borderColor} ${neon ? 'border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/10 hover:text-fuchsia-200 hover:shadow-[0_0_10px_rgba(232,121,249,0.2)]' : `hover:${highlightBg}`}`}
                >
                  Mark Complete
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkStatusChange('In Progress')}
                  className={`rounded-full ${borderColor} ${neon ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)]' : `hover:${highlightBg}`}`}
                >
                  Mark In Progress
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDelete}
                  className={`rounded-full ${neon ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_10px_rgba(255,0,0,0.2)]' : ''}`}
                >
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search Tasks</Label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${neon ? 'text-cyan-400/60' : 'text-gray-400'}`} />
                <Input
                  placeholder="Search tasks..."
                  className={`pl-10 rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-shadow' : ''}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Filter by Priority</Label>
              <Select
                value={filterPriority}
                onValueChange={(value: Priority | 'All') => setFilterPriority(value)}
              >
                <SelectTrigger className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400' : ''}`}>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent className={`rounded-xl ${cardBg} ${borderColor} ${neon ? 'bg-slate-950 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : ''}`}>
                  <SelectItem value="All">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select
                value={filterStatus}
                onValueChange={(value: Status | 'All') => setFilterStatus(value)}
              >
                <SelectTrigger className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400' : ''}`}>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className={`rounded-xl ${cardBg} ${borderColor} ${neon ? 'bg-slate-950 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : ''}`}>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Category</Label>
              <Select
                value={filterCategory}
                onValueChange={(value: Category | 'All') => setFilterCategory(value)}
              >
                <SelectTrigger className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400' : ''}`}>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className={`rounded-xl ${cardBg} ${borderColor} ${neon ? 'bg-slate-950 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : ''}`}>
                  <SelectItem value="All">All Categories</SelectItem>
                  {allCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex gap-2">
                <Select
                  value={sortField}
                  onValueChange={(value: 'priority' | 'status' | 'dueDate') => setSortField(value)}
                >
                  <SelectTrigger className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400' : ''}`}>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className={`rounded-xl ${cardBg} ${borderColor} ${neon ? 'bg-slate-950 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : ''}`}>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className={`rounded-full ${borderColor} ${neon ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)]' : `hover:${highlightBg}`}`}
                >
                  {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className={`overflow-hidden rounded-xl ${cardBg} ${borderColor} ${neon ? 'shadow-[0_0_20px_rgba(0,255,255,0.08)] border-cyan-500/30' : ''}`}>       
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={neon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : ''}>
              {activeTab === 'all' && 'All Tasks'}
              {activeTab === 'starred' && 'Starred Tasks'}
              {activeTab === 'today' && "Today's Tasks"}
              {activeTab === 'overdue' && 'Overdue Tasks'}
              <CardDescription className={`mt-1 ${mutedText}`}>
                {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'} found
              </CardDescription>
            </CardTitle>
            {sortedTasks.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all" 
                  checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className={`rounded ${neon ? 'border-cyan-500/40 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-400' : ''}`}
                />
                <Label htmlFor="select-all">Select all</Label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sortedTasks.length === 0 ? (
            <div className={`text-center py-8 ${mutedText} ${neon ? 'text-cyan-400/60' : ''}`}>
              No tasks found matching your filters
            </div>
          ) : (
            <div className="space-y-4 px-0">
              {sortedTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`border rounded-xl p-4 ${borderColor} ${
                    selectedTasks.includes(task.id) 
                      ? neon 
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(0,255,255,0.15)]' 
                        : selectedBg 
                      : neon 
                        ? 'bg-slate-950/50 border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_10px_rgba(0,255,255,0.1)] transition-all' 
                        : cardBg
                  }`}
                >
                  {editingTaskId === task.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={editTaskData?.title || ''}
                          onChange={(e) => editTaskData && setEditTaskData({...editTaskData, title: e.target.value})}
                          className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]' : ''}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={editTaskData?.description || ''}
                          onChange={(e) => editTaskData && setEditTaskData({...editTaskData, description: e.target.value})}
                          className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]' : ''}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                          value={editTaskData?.priority || 'Medium'}
                          onValueChange={(value: Priority) => editTaskData && setEditTaskData({...editTaskData, priority: value})}
                        >
                          <SelectTrigger className={`rounded-full ${inputBg} ${borderColor}`}>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className={`rounded-xl ${cardBg} ${borderColor} ${neon ? 'bg-slate-950 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : ''}`}>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={editTaskData?.status || 'Not Started'}
                          onValueChange={(value: Status) => editTaskData && setEditTaskData({...editTaskData, status: value})}
                        >
                          <SelectTrigger className={`rounded-full ${inputBg} ${borderColor}`}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className={`rounded-xl ${cardBg} ${borderColor} ${neon ? 'bg-slate-950 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : ''}`}>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={editTaskData?.dueDate || ''}
                          onChange={(e) => editTaskData && setEditTaskData({...editTaskData, dueDate: e.target.value})}
                          className={`rounded-full ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]' : ''}`}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button 
                          onClick={saveEdit} 
                          className={`gap-2 rounded-full ${neon ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]' : ''}`}
                          style={!neon ? { backgroundColor: buttonBg, color: buttonText } : undefined}
                        >
                          <Check className="h-4 w-4" /> Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelEdit} 
                          className={`gap-2 rounded-full ${borderColor} ${neon ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200' : `hover:${highlightBg}`}`}
                        >
                          <X className="h-4 w-4" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="flex items-center">
                        <Checkbox 
                          id={`select-${task.id}`}
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => toggleTaskSelection(task.id)}
                          className={`rounded ${neon ? 'border-cyan-500/40 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-400' : ''}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${neon ? 'drop-shadow-[0_0_6px_rgba(0,255,255,0.3)]' : ''}`}>{task.title}</h3>
                          {task.starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />}
                        </div>
                        <p className={`text-sm ${mutedText}`}>{task.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.categories.map(category => (
                            <span 
                              key={category} 
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${neon ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_6px_rgba(0,255,255,0.1)]' : `${highlightBg} ${textColor}`}`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`rounded-full ${getStatusColor(task.status)} hover:bg-opacity-80`}
                          onClick={() => toggleStatus(task.id)}                        
                        >
                          {task.status}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Calendar className={`h-4 w-4 mr-1 ${neon ? 'text-cyan-400' : ''}`} />
                            <span className="text-sm">
                              {formatIndianDate(task.dueDate)}
                            </span>
                          </div>
                          <div className="ml-5">
                            <span className={`text-sm ${getDueDateColor(task.dueDate)}`}>
                              {isOverdue(task.dueDate) && "(Overdue)"}
                              {isDueToday(task.dueDate) && "(Today)"}
                              {isDueSoon(task.dueDate) && !isDueToday(task.dueDate) && "(Due soon)"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStar(task.id)}
                            className={`h-8 w-8 p-0 rounded-full hover:bg-opacity-50 ${neon ? 'hover:bg-cyan-500/10' : ''}`}
                          >
                            <Star className={`h-4 w-4 ${task.starred ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]' : neon ? 'text-slate-500' : 'text-gray-400'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(task)}
                            className={`rounded-full hover:bg-opacity-50 ${neon ? 'text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300' : ''}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className={`rounded-full hover:bg-opacity-50 ${neon ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:shadow-[0_0_8px_rgba(255,0,0,0.2)]' : 'text-red-500 hover:text-red-600'}`}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
