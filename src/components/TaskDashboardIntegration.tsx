import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Star, Calendar, Edit, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  starred: boolean;
}

interface TaskDashboardIntegrationProps {
  theme: any;
  user: any;
}

export function TaskDashboardIntegration({ theme, user }: TaskDashboardIntegrationProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Load tasks from localStorage
    const loadTasks = () => {
      try {
        const savedTasks = localStorage.getItem('budget-app-tasks');
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          const userTasks = parsedTasks.filter((task: Task) => 
            !task.userId || task.userId === user.uid
          );
          setTasks(userTasks);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user?.uid]);

  const handleToggleStatus = (id: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          let newStatus: Task['status'];
          switch(task.status) {
            case 'Not Started': 
              newStatus = 'In Progress';
              break;
            case 'In Progress': 
              newStatus = 'Completed';
              break;
            case 'Completed': 
              newStatus = 'Not Started';
              break;
            default:
              newStatus = 'Not Started';
          }
          const updatedTask = { ...task, status: newStatus };
          const allTasks = prev.map(t => t.id === id ? updatedTask : t);
          localStorage.setItem('budget-app-tasks', JSON.stringify(allTasks));
          return updatedTask;
        }
        return task;
      });
      return updatedTasks;
    });
  };

  const handleToggleStar = (id: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => 
        task.id === id ? { ...task, starred: !task.starred } : task
      );
      localStorage.setItem('budget-app-tasks', JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => {
        const updatedTasks = prev.filter(task => task.id !== id);
        localStorage.setItem('budget-app-tasks', JSON.stringify(updatedTasks));
        return updatedTasks;
      });
    }
  };

  const handleEditTask = (task: Task) => {
    const tasksTab = document.querySelector('[value="tasks"]') as HTMLElement;
    if (tasksTab) {
      tasksTab.click();
    }
  };

  if (loading) {
    return (
      <Card className={`${theme?.cardBg || 'bg-white'} ${theme?.borderColor || 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTasks = tasks.slice(0, 5);

  return (
    <Card className={`${theme?.cardBg || 'bg-white'} ${theme?.borderColor || 'border-gray-200'}`}>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {recentTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks yet</p>
            <p className="text-sm mt-2">Create your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div 
                key={task.id} 
                className={`p-3 rounded-lg border ${theme?.highlightBg || 'bg-gray-50'} ${theme?.borderColor || 'border-gray-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleToggleStar(task.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Star className={`h-4 w-4 ${task.starred ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )}
