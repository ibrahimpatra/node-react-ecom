import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskManager.css';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState({ id: null, title: '' });
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Fetch tasks on mount
    useEffect(() => {
        axios
            .get('http://localhost:3000/tasks', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            .then(res => setTasks(res.data))
            .catch(err => setError(err.response?.data?.message || 'Failed to fetch tasks'));
    }, []);

    const handleSubmit = () => {
        if (!currentTask.title.trim()) {
            setError('Task title cannot be empty');
            return;
        }

        if (isEditing) {
            updateTask();
        } else {
            addTask();
        }
    };

    const addTask = () => {
        const task = { title: currentTask.title };
        axios
            .post('http://localhost:3000/tasks', task, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            .then(res => {
                setTasks([...tasks, res.data]);
                resetForm();
            })
            .catch(err => setError(err.response?.data?.message || 'Failed to add task'));
    };

    const updateTask = () => {
        axios
            .put(
                `http://localhost:3000/tasks/${currentTask.id}`,
                { title: currentTask.title },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            )
            .then(res => {
                setTasks(tasks.map(task => (task.id === currentTask.id ? res.data : task)));
                resetForm();
            })
            .catch(err => setError(err.response?.data?.message || 'Failed to update task'));
    };

    const deleteTask = id => {
        axios
            .delete(`http://localhost:3000/tasks/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            .then(() => {
                setTasks(tasks.filter(task => task.id !== id));
            })
            .catch(err => setError(err.response?.data?.message || 'Failed to delete task'));
    };

    const resetForm = () => {
        setCurrentTask({ id: null, title: '' });
        setIsEditing(false);
        setError('');
    };

    const editTask = task => {
        setCurrentTask(task);
        setIsEditing(true);
    };

    return (
        <div className="task-manager">
            <h2>Task Manager</h2>
            {error && <p className="error">{error}</p>}
            <div className="task-form">
                <input
                    type="text"
                    placeholder="Task Title"
                    value={currentTask.title}
                    onChange={e => setCurrentTask({ ...currentTask, title: e.target.value })}
                />
                <div className="form-buttons">
                    <button onClick={handleSubmit}>{isEditing ? 'Update Task' : 'Add Task'}</button>
                    {isEditing && <button onClick={resetForm}>Cancel</button>}
                </div>
            </div>
            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task.id} className="task-item">
                        <span>
                            {task.title} (Added by: {task.username})
                        </span>
                        <div className="task-actions">
                            <button onClick={() => editTask(task)}>Edit</button>
                            <button onClick={() => deleteTask(task.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskManager;
