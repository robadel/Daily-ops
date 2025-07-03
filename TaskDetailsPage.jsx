import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../contexts/TasksContext';
import { useAuth } from '../contexts/AuthContext';
import AudioRecorder from '../components/common/AudioRecorder';
import VoiceTextConverter from '../components/common/VoiceTextConverter';

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, addComment, updateTaskStatus } = useTasks();
  const { user } = useAuth();
  
  const [task, setTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('pt');

  // Find task by ID
  useEffect(() => {
    const foundTask = tasks.find(t => t.id === taskId);
    if (foundTask) {
      setTask(foundTask);
      setEditForm({
        title: foundTask.title,
        description: foundTask.description,
        priority: foundTask.priority,
        startTime: foundTask.startTime ? foundTask.startTime.toISOString().slice(0, 16) : '',
        duration: foundTask.duration || ''
      });
    } else if (tasks.length > 0) {
      // Task not found, redirect back
      navigate(-1);
    }
  }, [taskId, tasks, navigate]);

  const handleEdit = async () => {
    if (isEditing) {
      // Save changes
      try {
        setLoading(true);
        await updateTask(taskId, editForm);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating task:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await addComment(taskId, { text: newComment });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioComment = async (audioData) => {
    try {
      setLoading(true);
      await addComment(taskId, { 
        text: 'Comentário em áudio',
        audioUrl: audioData.audioUrl 
      });
    } catch (error) {
      console.error('Error adding audio comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return language === 'pt' ? 'Pendente' : 'Pending';
      case 'in-progress': return language === 'pt' ? 'Em Andamento' : 'In Progress';
      case 'completed': return language === 'pt' ? 'Concluída' : 'Completed';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return language === 'pt' ? 'Alta' : 'High';
      case 'medium': return language === 'pt' ? 'Média' : 'Medium';
      case 'low': return language === 'pt' ? 'Baixa' : 'Low';
      default: return priority;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (language === 'pt') {
      return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
    } else {
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const texts = {
    pt: {
      taskDetails: 'Detalhes da Tarefa',
      title: 'Título',
      description: 'Descrição',
      priority: 'Prioridade',
      status: 'Status',
      startTime: 'Horário de Início',
      duration: 'Duração',
      assignedTo: 'Atribuído para',
      createdBy: 'Criado por',
      createdAt: 'Criado em',
      edit: 'Editar',
      save: 'Salvar',
      cancel: 'Cancelar',
      startTask: 'Iniciar Tarefa',
      completeTask: 'Concluir Tarefa',
      reopenTask: 'Reabrir Tarefa',
      comments: 'Comentários',
      addComment: 'Adicionar Comentário',
      writeComment: 'Escreva seu comentário...',
      send: 'Enviar',
      recordAudio: 'Gravar Áudio',
      readAloud: 'Ler em Voz Alta',
      translate: 'Traduzir',
      noComments: 'Nenhum comentário ainda'
    },
    en: {
      taskDetails: 'Task Details',
      title: 'Title',
      description: 'Description',
      priority: 'Priority',
      status: 'Status',
      startTime: 'Start Time',
      duration: 'Duration',
      assignedTo: 'Assigned to',
      createdBy: 'Created by',
      createdAt: 'Created at',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      startTask: 'Start Task',
      completeTask: 'Complete Task',
      reopenTask: 'Reopen Task',
      comments: 'Comments',
      addComment: 'Add Comment',
      writeComment: 'Write your comment...',
      send: 'Send',
      recordAudio: 'Record Audio',
      readAloud: 'Read Aloud',
      translate: 'Translate',
      noComments: 'No comments yet'
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{t.taskDetails}</h1>
            
            <div className="flex items-center space-x-2">
              {/* Language Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('pt')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    language === 'pt' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  PT
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    language === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Edit Button (Manager only) */}
              {user.userType === 'manager' && (
                <button
                  onClick={handleEdit}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isEditing ? t.save : t.edit}
                </button>
              )}

              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  {t.cancel}
                </button>
              )}
            </div>
          </div>

          {/* Task Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.title}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{task.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.description}
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-start space-x-2">
                    <p className="text-gray-700 flex-1">{task.description}</p>
                    <VoiceTextConverter 
                      text={task.description}
                      language={language}
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.priority}
                </label>
                {isEditing ? (
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">{getPriorityText('low')}</option>
                    <option value="medium">{getPriorityText('medium')}</option>
                    <option value="high">{getPriorityText('high')}</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityText(task.priority)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.status}
                </label>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.startTime}
                </label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{formatDateTime(task.startTime)}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.duration}
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                    placeholder="Minutos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{formatDuration(task.duration)}</p>
                )}
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.assignedTo}
                </label>
                <p className="text-gray-700">{task.assignedToName || 'Não atribuído'}</p>
              </div>

              {/* Created Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.createdBy}
                </label>
                <p className="text-gray-700">{task.managerName}</p>
                <p className="text-sm text-gray-500">{formatDateTime(task.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Status Actions (Labor only) */}
          {user.userType === 'labor' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                {task.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange('in-progress')}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {t.startTask}
                  </button>
                )}
                
                {task.status === 'in-progress' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {t.completeTask}
                  </button>
                )}
                
                {task.status === 'completed' && user.userType === 'manager' && (
                  <button
                    onClick={() => handleStatusChange('pending')}
                    disabled={loading}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {t.reopenTask}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.comments}</h2>
          
          {/* Add Comment */}
          <div className="mb-6">
            <div className="flex space-x-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t.writeComment}
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleAddComment}
                  disabled={loading || !newComment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {t.send}
                </button>
                
                {/* Audio Comment (Labor only) */}
                {user.userType === 'labor' && (
                  <AudioRecorder
                    onRecordingComplete={handleAudioComment}
                    buttonText={t.recordAudio}
                    size="sm"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {task.comments && task.comments.length > 0 ? (
              task.comments.map((comment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{comment.authorName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        comment.authorType === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {comment.authorType === 'manager' ? 'Manager' : 'Labor'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <p className="text-gray-700 flex-1">{comment.text}</p>
                    {comment.text && (
                      <VoiceTextConverter 
                        text={comment.text}
                        language={language}
                        size="sm"
                      />
                    )}
                  </div>
                  
                  {comment.audioUrl && (
                    <div className="mt-2">
                      <audio controls className="w-full">
                        <source src={comment.audioUrl} type="audio/webm" />
                        Seu navegador não suporta áudio.
                      </audio>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">{t.noComments}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;

