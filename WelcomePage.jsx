import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Globe } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('pt');

  const translations = {
    pt: {
      title: 'DailyOps',
      subtitle: 'Roberts Properties Management',
      description: 'Sistema de gerenciamento de tarefas para equipes',
      managerButton: 'Sou Manager',
      laborButton: 'Sou Labor',
      managerDesc: 'Gerencie sua equipe e atribua tarefas',
      laborDesc: 'Receba e execute tarefas da sua equipe',
      developedBy: 'Desenvolvido por Triplo H Desenvolvimento',
      language: 'Idioma'
    },
    en: {
      title: 'DailyOps',
      subtitle: 'Roberts Properties Management',
      description: 'Task management system for teams',
      managerButton: 'I am Manager',
      laborButton: 'I am Labor',
      managerDesc: 'Manage your team and assign tasks',
      laborDesc: 'Receive and execute tasks from your team',
      developedBy: 'Developed by Triplo H Desenvolvimento',
      language: 'Language'
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Language Selector */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border">
            <Globe className="w-4 h-4 text-gray-500" />
            <button
              onClick={() => setLanguage('pt')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === 'pt' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              PT
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === 'en' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 dailyops-shadow">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-lg text-primary font-medium">{t.subtitle}</p>
          <p className="text-gray-600">{t.description}</p>
        </div>

        {/* User Type Selection */}
        <div className="space-y-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
            onClick={() => navigate('/register/manager')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t.managerButton}</CardTitle>
                  <CardDescription>{t.managerDesc}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
            onClick={() => navigate('/register/labor')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t.laborButton}</CardTitle>
                  <CardDescription>{t.laborDesc}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            {language === 'pt' ? 'Já tem uma conta?' : 'Already have an account?'}
          </p>
          <Button 
            variant="link" 
            onClick={() => navigate('/login')}
            className="text-primary font-medium"
          >
            {language === 'pt' ? 'Fazer Login' : 'Sign In'}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-6">
          <p className="text-xs text-gray-500">{t.developedBy}</p>
        </div>
      </div>
    </div>
  );
}

