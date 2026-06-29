import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Star, Calendar, Edit, Trash2 } from 'lucide-react';
import { ThemeName, themes } from '@/lib/theme';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  starred: boolean;
}

interface TaskDashboardIntegrationProps {
  themeName: ThemeName;
  user: any;
}

export function TaskDashboardIntegration({ themeName, user }: TaskDashboardIntegrationProps) {
  const currentTheme = themes[themeName] || themes['blue-smoke'];
  const { cardBg, borderColor, highlightBg, mutedText } = currentTheme;
  const neon = themeName === 'neon-cyberpunk';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

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
      <Card className={`${cardBg} ${borderColor} ${neon ? 'shadow-[0_0_25px_rgba(0,255,255,0.08)] border-cyan-500/20' : ''}`}>
        <CardHeader>
          <CardTitle className={neon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : ''}>
            Recent Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className={`h-4 rounded mb-3 ${neon ? 'bg-cyan-500/10 border border-cyan-500/10' : 'bg-gray-200'}`}></div>
            <div className={`h-4 rounded mb-3 ${neon ? 'bg-cyan-500/10 border border-cyan-500/10' : 'bg-gray-200'}`}></div>
            <div className={`h-4 rounded ${neon ? 'bg-cyan-500/10 border border-cyan-500/10' : 'bg-gray-200'}`}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTasks = tasks.slice(0, 5);

  return (
    <Card className={`${cardBg} ${borderColor} ${neon ? 'shadow-[0_0_25px_rgba(0,255,255,0.08)] border-cyan-500/20' : ''}`}>
      <CardHeader>
        <CardTitle className={neon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : ''}>
          Recent Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTasks.length === 0 ? (
          <div className={`text-center py-8 ${neon ? 'text-slate-400' : 'text-gray-500'}`}>
            <p className={neon ? 'drop-shadow-[0_0_4px_rgba(0,255,255,0.15)]' : ''}>No tasks yet</p>
            <p className={`text-sm mt-2 ${neon ? 'text-slate-500' : ''}`}>Create your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div 
                key={task.id} 
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  neon 
                    ? 'bg-slate-900/80 border-cyan-500/15 hover:border-cyan-500/35 hover:shadow-[0_0_12px_rgba(0,255,255,0.08)]' 
                    : `${highlightBg} ${borderColor}`
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm mb-1 ${
                      neon 
                        ? 'text-cyan-100 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]' 
                        : ''
                    }`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Priority Badge */}
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'High' 
                          ? neon 
                            ? 'bg-red-500/15 text-red-300 border border-red-500/30 shadow-[0_0_6px_rgba(248,113,113,0.15)]' 
                            : 'bg-red-100 text-red-800'
                          : task.priority === 'Medium' 
                            ? neon 
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_6px_rgba(245,158,11,0.15)]' 
                              : 'bg-yellow-100 text-yellow-800'
                            : neon 
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_6px_rgba(52,211,153,0.15)]' 
                              : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      {/* Status Badge */}
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.status === 'Completed' 
                          ? neon 
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_6px_rgba(52,211,153,0.15)]' 
                            : 'bg-green-100 text-green-800'
                          : task.status === 'In Progress' 
                            ? neon 
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_6px_rgba(0,255,255,0.15)]' 
                              : 'bg-blue-100 text-blue-800'
                            : neon 
                              ? 'bg-slate-500/15 text-slate-300 border border-slate-500/30' 
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      {/* Due Date */}
                      {task.dueDate && (
                        <span className={`text-xs flex items-center gap-1 ${
                          neon ? 'text-slate-400' : 'text-gray-500'
                        }`}>
                          <Calendar className={`h-3 w-3 ${neon ? 'text-cyan-500/60' : ''}`} />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleToggleStar(task.id)}
                      className={`p-1 rounded transition-all duration-300 ${
                        neon 
                          ? task.starred 
                            ? 'hover:bg-amber-500/15' 
                            : 'hover:bg-cyan-500/10' 
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`h-4 w-4 transition-all duration-300 ${
                        task.starred 
                          ? neon 
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]' 
                            : 'fill-yellow-500 text-yellow-500' 
                          : neon 
                            ? 'text-slate-600 hover:text-cyan-400' 
                            : 'text-gray-400'
                      }`} />
                    </button>
                    <button
                      onClick={() => handleEditTask(task)}
                      className={`p-1 rounded transition-all duration-300 ${
                        neon 
                          ? 'hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400' 
                          : 'hover:bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className={`p-1 rounded transition-all duration-300 ${
                        neon 
                          ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400 hover:drop-shadow-[0_0_6px_rgba(248,113,113,0.4)]' 
                          : 'hover:bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}