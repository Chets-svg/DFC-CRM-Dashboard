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
  getButtonClasses 
} from '@/lib/theme'
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';

interface EnhancedTaskTabProps {
  theme: ThemeName;
}

// Set your desired theme here
const theme: ThemeName = 'blue-smoke'; 
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
interface EnhancedTaskTabProps {
  theme: ThemeName;
}
export default function EnhancedTaskTab({ theme }: EnhancedTaskTabProps) {
  const { user } = useAuth();
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const TASKS_COLLECTION = 'tasks';
  
  // Destructure theme colors
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

  // Firestore CRUD operations
   const addTaskToFirestore = async (taskData: Omit<Task, 'id'>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

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
      await addTaskToFirestore({
        ...newTask,
        userId: user?.uid || ''
      });
      
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
  
  // Helper functions
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
      setTasks(tasks.map(task => 
        task.id === taskId ? {...task, status: newStatus} : task
      ));
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
      setTasks(tasks.map(task => 
        task.id === id ? {...task, starred: newStarred} : task
      ));
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const saveEdit = async () => {
    if (!editTaskData || !editingTaskId) return;
    
    try {
      await updateTaskInFirestore(editingTaskId, editTaskData);
      setTasks(tasks.map(task => 
        task.id === editingTaskId ? editTaskData : task
      ));
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
      await Promise.all(
        selectedTasks.map(id => updateTaskInFirestore(id, { status }))
      );
      setTasks(tasks.map(task => 
        selectedTasks.includes(task.id) ? {...task, status} : task
      ));
    } catch (error) {
      console.error('Error during bulk status change:', error);
    }
  };

  const addCategory = () => {
    if (!newCategory || newTask.categories.includes(newCategory as Category)) return
    setNewTask({
      ...newTask,
      categories: [...newTask.categories, newCategory as Category]
    })
    setNewCategory('')
  }

  const removeCategory = (category: Category) => {
    setNewTask({
      ...newTask,
      categories: newTask.categories.filter(c => c !== category)
    })
  }

  const toggleSelectAll = useCallback(() => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task.id));
    }
  }, [tasks, selectedTasks]);

  // Toggle selection for a single task
  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  }, []);

  // Delete selected tasks
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


  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const priorityMatch = filterPriority === 'All' || task.priority === filterPriority
    const statusMatch = filterStatus === 'All' || task.status === filterStatus
    const categoryMatch = filterCategory === 'All' || task.categories.includes(filterCategory)
    const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       task.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    let tabMatch = true
    if (activeTab === 'starred') tabMatch = task.starred
    if (activeTab === 'today') tabMatch = isDueToday(task.dueDate)
    if (activeTab === 'overdue') tabMatch = isOverdue(task.dueDate)

    return priorityMatch && statusMatch && categoryMatch && searchMatch && tabMatch
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortField === 'priority') {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 }
      return sortDirection === 'asc' 
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority]
    } else if (sortField === 'status') {
      const statusOrder = { 'Not Started': 1, 'In Progress': 2, 'Completed': 3 }
      return sortDirection === 'asc'
        ? statusOrder[a.status] - statusOrder[b.status]
        : statusOrder[b.status] - statusOrder[a.status]
    } else {
      return sortDirection === 'asc'
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    }
  })

  // UI helpers
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    }
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'Completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
    }
  }

  const getDueDateColor = (dueDate: string) => {
    if (isOverdue(dueDate)) return 'text-red-700 dark:text-red-500 font-bold'
    if (isDueToday(dueDate)) return 'text-blue-700 dark:text-blue-500 font-bold'
    if (isDueSoon(dueDate)) return 'text-green-700 dark:text-green-500 font-bold'
    return 'text-gray-600 dark:text-gray-400'
  }

  const allCategories: Category[] = ['Work', 'Personal', 'Urgent', 'Follow Up', 'Meeting']
 const renderTasks = (filteredTasks: Task[]) => (
    <div className="space-y-4">
      {filteredTasks.map(task => (
        <Card key={task.id} className={`${cardBg} ${borderColor}`}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{task.title}</span>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  {task.starred ? '⭐' : '☆'}
                </Button>
                <Button size="icon" variant="destructive" onClick={() => deleteTask(task.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{task.description}</p>
            <p className="text-xs">Priority: {task.priority}</p>
            <p className="text-xs">Status: {task.status}</p>
            <p className="text-xs">Due: {task.dueDate || 'N/A'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <div className="p-4">Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${bgColor} ${textColor}`}>
            {/* Task View Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className={`grid grid-cols-4 w-full ${cardBg} border ${borderColor}`}>
            <TabsTrigger 
            value="all" 
            className={`data-[state=active]:${buttonBg} data-[state=active]:${buttonText}`}
          >
            All Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="starred" 
            className={`data-[state=active]:${buttonBg} data-[state=active]:${buttonText}`}
          >
            Starred
          </TabsTrigger>
          <TabsTrigger 
            value="today" 
            className={`data-[state=active]:${buttonBg} data-[state=active]:${buttonText}`}
          >
            Today
          </TabsTrigger>
          <TabsTrigger 
            value="overdue" 
            className={`data-[state=active]:${buttonBg} data-[state=active]:${buttonText}`}
          >
            Overdue
          </TabsTrigger>
        </TabsList>

<TabsContent value="starred">
  {renderTasks(tasks.filter(task => task.starred))}
</TabsContent>

<TabsContent value="today">
  {renderTasks(tasks.filter(task => {
    const today = new Date().toISOString().split("T")[0];
    return task.dueDate === today;
  }))}
</TabsContent>

<TabsContent value="overdue">
  {renderTasks(tasks.filter(task => {
    const today = new Date().toISOString().split("T")[0];
    return task.dueDate && task.dueDate < today;
  }))}
</TabsContent>
<TabsContent value="all">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
    {tasks.map(task => (
      <Card
        key={task.id}
        className={`p-4 shadow-md rounded-lg border ${cardBg} ${borderColor} ${textColor}`}
      >
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{task.title}</span>
            <span className="text-yellow-500">{task.starred ? '⭐' : '☆'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>{task.description}</p>
          <p>
            <span className="font-medium">Due:</span>{' '}
            <span className="font-semibold">{formatIndianDate(task.dueDate)}</span>
          </p>
          <p>
            <span className="font-medium">Priority:</span> {task.priority}
          </p>
          <p>
            <span className="font-medium">Status:</span> {task.status}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>
      </Tabs>
 
      {/* Add Task Section */}
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
                className={`${inputBg} ${borderColor}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description"
                className={`${inputBg} ${borderColor}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value: Priority) => setNewTask({...newTask, priority: value})}
              >
                <SelectTrigger className={`${inputBg} ${borderColor}`}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className={`${cardBg} ${borderColor}`}>
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
  className={`${inputBg} ${borderColor}`}
/>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newTask.categories.map(category => (
                  <span 
                    key={category} 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${highlightBg} ${textColor}`}
                  >
                    {category}
                    <button 
                      type="button" 
                      onClick={() => removeCategory(category)}
                      className={`${inputBg} ${borderColor}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Select
                  value={newCategory}
                  onValueChange={setNewCategory}
                >
                  <SelectTrigger className={`${inputBg} ${borderColor}`}>
                    <SelectValue placeholder="Add category" />
                  </SelectTrigger>
                  <SelectContent className={`${cardBg} ${borderColor}`}>
                    {allCategories
                      .filter(cat => !newTask.categories.includes(cat))
                      .map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={addCategory}
                  className={`${inputBg} ${borderColor}`}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <div>
              <Checkbox 
                id="starred" 
                checked={newTask.starred}
                onCheckedChange={(checked) => setNewTask({...newTask, starred: !!checked})}
              />
              <Label htmlFor="starred" className="ml-2">
                Starred
              </Label>
            </div>
            <Button 
              onClick={handleAddTask} 
              className="gap-2"
              style={{
                backgroundColor: buttonBg,
                color: buttonText,
              }}
            >
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Controls Section */}
<Card className={`${cardBg} border ${borderColor}`}>
          <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Task Controls</CardTitle>
            {selectedTasks.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkStatusChange('Completed')}
                  className={`${borderColor} hover:${highlightBg}`}
                >
                  Mark Complete
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkStatusChange('In Progress')}
                  className={`${borderColor} hover:${highlightBg}`}
                >
                  Mark In Progress
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDelete}
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  className={`pl-10 ${inputBg} ${borderColor}`}
                  
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
                <SelectTrigger className={`${inputBg} ${borderColor}`}>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent className={`${cardBg} ${borderColor}`}>
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
                <SelectTrigger className={`${inputBg} ${borderColor}`}>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className={`${cardBg} ${borderColor}`}>
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
                <SelectTrigger className={`${inputBg} ${borderColor}`}>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className={`${cardBg} ${borderColor}`}>
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
                  <SelectTrigger className={`${inputBg} ${borderColor}`}>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className={`${cardBg} ${borderColor}`}>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className={`${borderColor} hover:${highlightBg}`}
                >
                  {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
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
                />
                <Label htmlFor="select-all">Select all</Label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sortedTasks.length === 0 ? (
            <div className={`text-center py-8 ${mutedText}`}>
              No tasks found matching your filters
            </div>
          ) : (
            <div className="space-y-4 px-0">
              {sortedTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`border rounded-lg p-4 ${borderColor} ${
                    selectedTasks.includes(task.id) ? selectedBg : cardBg
                  }`}
                >
                  {editingTaskId === task.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={editTaskData?.title || ''}
                          onChange={(e) => editTaskData && setEditTaskData({...editTaskData, title: e.target.value})}
                          className={`${inputBg} ${borderColor}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={editTaskData?.description || ''}
                          onChange={(e) => editTaskData && setEditTaskData({...editTaskData, description: e.target.value})}
                          className={`${inputBg} ${borderColor}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                          value={editTaskData?.priority || 'Medium'}
                          onValueChange={(value: Priority) => editTaskData && setEditTaskData({...editTaskData, priority: value})}
                        >
                          <SelectTrigger className={`${inputBg} ${borderColor}`}>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className={`${cardBg} ${borderColor}`}>
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
                          <SelectTrigger className={`${inputBg} ${borderColor}`}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className={`${cardBg} ${borderColor}`}>
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
  className={`${inputBg} ${borderColor}`}
/>
                      </div>
                      <div className="flex items-end gap-2">
                        <Button 
                          onClick={saveEdit} 
                          className="gap-2"
                          style={{
                            backgroundColor: buttonBg,
                            color: buttonText,
                          }}
                        >
                          <Check className="h-4 w-4" /> Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelEdit} 
                          className={`gap-2 ${borderColor} hover:${highlightBg}`}
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
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{task.title}</h3>
                          {task.starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <p className={`text-sm ${mutedText}`}>{task.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.categories.map(category => (
                            <span 
                              key={category} 
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${highlightBg} ${textColor}`}
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
                          className={`${getStatusColor(task.status)} hover:bg-opacity-80`}
                          onClick={() => toggleStatus(task.id)}
                          
                        >
                          {task.status}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
  <div className="flex flex-col">
    <div className="flex items-center">
      <Calendar className="h-4 w-4 mr-1" />
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
      className="h-8 w-8 p-0 hover:bg-opacity-50"
    >
      <Star className={`h-4 w-4 ${task.starred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => startEditing(task)}
      className="hover:bg-opacity-50"
    >
      <Edit className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleDeleteTask(task.id)}
      className="hover:bg-opacity-50 text-red-500 hover:text-red-600"
    >
      <Trash className="h-4 w-4" />
    </Button>
  </div>
</div>                    </div>
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

