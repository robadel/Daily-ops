import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../contexts/TasksContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import AudioRecorder from '../components/common/AudioRecorder';
import VoiceTextConverter from '../components/common/VoiceTextConverter';
import ImageUploader from '../components/common/ImageUploader';

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const { createTask } = useTasks();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    startTime: '',
    duration: ''
  });
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('pt');

  // Load team members (labors linked to this manager)
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!user || user.userType !== 'manager') return;

      try {
        const q = query(
          collection(db, 'users'),
          where('userType', '==', 'labor'),
          where('managerCode', '==', user.teamCode)
        );
        
        const snapshot = await getDocs(q);
        const members = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTeamMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    };

    loadTeamMembers();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDescriptionVoice = (text) => {
    setFormData(prev => ({
      ...prev,
      description: text
    }));
  };

  const handleAudioRecording = (audioData) => {
    setAudioBlob(audioData.audioBlob);
  };

  const handleImagesChange = (imageList) => {
    setImages(imageList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert(language === 'pt' ? 'Título e descrição são obrigatórios' : 'Title and description are required');
      return;
    }

    if (!formData.assignedTo) {
      alert(language === 'pt' ? 'Selecione um membro da equipe' : 'Select a team member');
      return;
    }

    try {
      setLoading(true);
      
      const selectedMember = teamMembers.find(member => member.id === formData.assignedTo);
      
      const taskData = {
        ...formData,
        assignedToName: selectedMember?.displayName || selectedMember?.email,
        audioBlob: audioBlob,
        images: images,
        duration: formData.duration ? parseInt(formData.duration) : null
      };

      await createTask(taskData);
      
      alert(language === 'pt' ? 'Tarefa criada com sucesso!' : 'Task created successfully!');
      navigate('/dashboard/manager');
      
    } catch (error) {
      console.error('Error creating task:', error);
      alert(language === 'pt' ? 'Erro ao criar tarefa' : 'Error creating task');
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    pt: {
      createTask: 'Criar Nova Tarefa',
      title: 'Título',
      titlePlaceholder: 'Digite o título da tarefa',
      description: 'Descrição',
      descriptionPlaceholder: 'Descreva a tarefa detalhadamente',
      priority: 'Prioridade',
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
      assignTo: 'Atribuir para',
      selectMember: 'Selecione um membro da equipe',
      startTime: 'Horário de Início',
      duration: 'Duração (minutos)',
      durationPlaceholder: 'Ex: 60 para 1 hora',
      audioInstructions: 'Instruções em Áudio',
      images: 'Imagens Anexas',
      create: 'Criar Tarefa',
      cancel: 'Cancelar',
      speakDescription: 'Falar Descrição',
      readDescription: 'Ler Descrição',
      translateDescription: 'Traduzir Descrição',
      noTeamMembers: 'Nenhum membro da equipe encontrado. Compartilhe seu código da equipe para adicionar membros.'
    },
    en: {
      createTask: 'Create New Task',
      title: 'Title',
      titlePlaceholder: 'Enter task title',
      description: 'Description',
      descriptionPlaceholder: 'Describe the task in detail',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      assignTo: 'Assign to',
      selectMember: 'Select a team member',
      startTime: 'Start Time',
      duration: 'Duration (minutes)',
      durationPlaceholder: 'Ex: 60 for 1 hour',
      audioInstructions: 'Audio Instructions',
      images: 'Attached Images',
      create: 'Create Task',
      cancel: 'Cancel',
      speakDescription: 'Speak Description',
      readDescription: 'Read Description',
      translateDescription: 'Translate Description',
      noTeamMembers: 'No team members found. Share your team code to add members.'
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t.createTask}</h1>
            
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
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.title} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t.titlePlaceholder}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description with Voice Features */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.description} *
                </label>
                <div className="space-y-2">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={t.descriptionPlaceholder}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {/* Voice Controls */}
                  <div className="flex items-center space-x-2">
                    <VoiceTextConverter
                      text={formData.description}
                      onTextChange={handleDescriptionVoice}
                      language={language}
                      showSpeechToText={true}
                      showTextToSpeech={true}
                      showTranslate={true}
                    />
                    <span className="text-sm text-gray-500">
                      {language === 'pt' ? 'Use os botões para falar, ouvir ou traduzir' : 'Use buttons to speak, listen or translate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.priority}
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">{t.low}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="high">{t.high}</option>
                </select>
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.assignTo} *
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.selectMember}</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.displayName || member.email}
                    </option>
                  ))}
                </select>
                
                {teamMembers.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    {t.noTeamMembers}
                  </p>
                )}
              </div>
            </div>

            {/* Scheduling */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {language === 'pt' ? 'Agendamento' : 'Scheduling'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.startTime}
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.duration}
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder={t.durationPlaceholder}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Audio Instructions */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t.audioInstructions}
              </h3>
              <AudioRecorder
                onRecordingComplete={handleAudioRecording}
                buttonText={language === 'pt' ? 'Gravar Instruções' : 'Record Instructions'}
              />
            </div>

            {/* Images */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t.images}
              </h3>
              <ImageUploader
                onImagesChange={handleImagesChange}
                maxImages={5}
                language={language}
              />
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard/manager')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{language === 'pt' ? 'Criando...' : 'Creating...'}</span>
                  </div>
                ) : (
                  t.create
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;

