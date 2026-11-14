import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Project Editing States
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editProjectData, setEditProjectData] = useState({ title: '', description: '' });

  // Tasks States
  const [tasks, setTasks] = useState({});
  const [taskInputs, setTaskInputs] = useState({});
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  const API_PROJECTS = 'http://localhost:8080/api/projects';
  const API_TASKS = 'http://localhost:8080/api/tasks';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(API_PROJECTS);
      setProjects(response.data);
      response.data.forEach(proj => fetchTasks(proj.id));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const response = await axios.get(`${API_TASKS}/project/${projectId}`);
      setTasks(prev => ({ ...prev, [projectId]: response.data }));
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
    }
  };

  // --- PROJECT HANDLERS ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await axios.post(API_PROJECTS, { title, description, status: 'IN_PROGRESS' });
      setTitle('');
      setDescription('');
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleToggleProjectStatus = async (proj) => {
    const newStatus = proj.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      await axios.put(`${API_PROJECTS}/${proj.id}`, {
        ...proj,
        status: newStatus
      });
      fetchProjects();
    } catch (error) {
      console.error("Error updating project status:", error);
    }
  };

  const startEditingProject = (proj) => {
    setEditingProjectId(proj.id);
    setEditProjectData({ title: proj.title, description: proj.description || '' });
  };

  const handleUpdateProject = async (proj) => {
    if (!editProjectData.title.trim()) return;
    try {
      await axios.put(`${API_PROJECTS}/${proj.id}`, {
        ...proj,
        title: editProjectData.title,
        description: editProjectData.description
      });
      setEditingProjectId(null);
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`${API_PROJECTS}/${id}`);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // --- TASK HANDLERS ---
  const handleTaskInputChange = (projectId, value) => {
    setTaskInputs(prev => ({ ...prev, [projectId]: value }));
  };

  const handleCreateTask = async (projectId, e) => {
    e.preventDefault();
    const taskTitle = taskInputs[projectId];
    if (!taskTitle || !taskTitle.trim()) return;

    try {
      await axios.post(`${API_TASKS}/project/${projectId}`, {
        title: taskTitle,
        status: 'PENDING'
      });
      setTaskInputs(prev => ({ ...prev, [projectId]: '' }));
      fetchTasks(projectId);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleToggleTaskStatus = async (task, projectId) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await axios.put(`${API_TASKS}/${task.id}`, {
        ...task,
        status: newStatus
      });
      fetchTasks(projectId);
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
  };

  const handleUpdateTask = async (task, projectId) => {
    if (!editTaskTitle.trim()) return;
    try {
      await axios.put(`${API_TASKS}/${task.id}`, {
        ...task,
        title: editTaskTitle
      });
      setEditingTaskId(null);
      fetchTasks(projectId);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId, projectId) => {
    try {
      await axios.delete(`${API_TASKS}/${taskId}`);
      fetchTasks(projectId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-cyan-400">DevFlow Studio</h1>
            <p className="text-sm text-slate-400 mt-1">Full-Stack Project & Task Management Hub</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
            Backend Connected 🟢
          </span>
        </header>

        {/* Create Project Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Project Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Cloud Infrastructure Setup" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Briefly describe the project goals..." 
                rows="2"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-6 py-2.5 rounded-lg transition shadow-lg shadow-cyan-900/20 cursor-pointer">
              Create Project
            </button>
          </form>
        </div>

        {/* Active Projects List */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-200">Active Projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 border border-slate-800/60 rounded-xl text-slate-500">
              No projects found. Create your first project above!
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((proj) => {
                const projectTasks = tasks[proj.id] || [];
                const isEditingProj = editingProjectId === proj.id;
                const isProjCompleted = proj.status === 'COMPLETED';

                return (
                  <div key={proj.id} className={`bg-slate-900 border ${isProjCompleted ? 'border-emerald-500/30' : 'border-slate-800'} rounded-xl p-6 shadow-md transition`}>
                    
                    {/* Project Header / Edit Form */}
                    {isEditingProj ? (
                      <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <input
                          type="text"
                          value={editProjectData.title}
                          onChange={(e) => setEditProjectData({ ...editProjectData, title: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 text-lg font-bold focus:outline-none focus:border-cyan-500"
                        />
                        <textarea
                          rows="2"
                          value={editProjectData.description}
                          onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateProject(proj)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-1.5 rounded cursor-pointer">
                            Save Changes
                          </button>
                          <button onClick={() => setEditingProjectId(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-4 py-1.5 rounded cursor-pointer">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                        <div>
                          <h3 className={`font-bold text-xl ${isProjCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {proj.title}
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">{proj.description || 'No description provided.'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Clickable Status Toggle Badge */}
                          <button
                            onClick={() => handleToggleProjectStatus(proj)}
                            title="Click to toggle status"
                            className={`text-xs px-2.5 py-1.5 rounded-md border font-medium transition cursor-pointer ${
                              isProjCompleted
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20'
                            }`}
                          >
                            {isProjCompleted ? '✓ COMPLETED' : '⏳ IN_PROGRESS'}
                          </button>

                          <button 
                            onClick={() => startEditingProject(proj)}
                            className="text-amber-400 hover:text-amber-300 text-xs font-medium px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 transition cursor-pointer"
                          >
                            Edit
                          </button>

                          <button 
                            onClick={() => handleDeleteProject(proj.id)}
                            className="text-rose-400 hover:text-rose-300 text-xs font-medium px-3 py-1.5 rounded bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tasks Section Inside Project */}
                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <h4 className="text-sm font-bold text-slate-300 mb-3">Tasks ({projectTasks.length})</h4>
                      
                      {projectTasks.length === 0 ? (
                        <p className="text-xs text-slate-500 mb-4">No tasks added yet for this project.</p>
                      ) : (
                        <div className="space-y-2 mb-4">
                          {projectTasks.map((task) => {
                            const isTaskCompleted = task.status === 'COMPLETED';
                            const isEditingThisTask = editingTaskId === task.id;

                            return (
                              <div key={task.id} className="flex justify-between items-center bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-lg text-sm">
                                {isEditingThisTask ? (
                                  <div className="flex items-center gap-2 flex-1 mr-2">
                                    <input
                                      type="text"
                                      value={editTaskTitle}
                                      onChange={(e) => setEditTaskTitle(e.target.value)}
                                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm text-slate-100 flex-1 focus:outline-none focus:border-cyan-500"
                                    />
                                    <button onClick={() => handleUpdateTask(task, proj.id)} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded cursor-pointer">
                                      Save
                                    </button>
                                    <button onClick={() => setEditingTaskId(null)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded cursor-pointer">
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center space-x-3">
                                      <input
                                        type="checkbox"
                                        checked={isTaskCompleted}
                                        onChange={() => handleToggleTaskStatus(task, proj.id)}
                                        className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                                      />
                                      <span className={`font-medium ${isTaskCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                        {task.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <button 
                                        onClick={() => startEditingTask(task)}
                                        className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteTask(task.id, proj.id)}
                                        className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Task Form */}
                      <form onSubmit={(e) => handleCreateTask(proj.id, e)} className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Add a new task..." 
                          value={taskInputs[proj.id] || ''}
                          onChange={(e) => handleTaskInputChange(proj.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-100 flex-1 focus:outline-none focus:border-cyan-500"
                        />
                        <button 
                          type="submit" 
                          className="bg-slate-800 hover:bg-slate-700 text-cyan-400 text-sm font-medium px-4 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                        >
                          Add Task
                        </button>
                      </form>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;