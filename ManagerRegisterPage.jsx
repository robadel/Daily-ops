import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Eye, EyeOff, ArrowLeft, Copy, Share, CheckCircle } from 'lucide-react';

export default function ManagerRegisterPage() {
  const navigate = useNavigate();
  const { registerManager, error, loading, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      return;
    }
    
    if (!formData.email.trim()) {
      return;
    }
    
    if (formData.password.length < 6) {
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const result = await registerManager(
      formData.email,
      formData.password,
      formData.name
    );

    if (result.success) {
      setGeneratedCode(result.teamCode);
      setRegistrationSuccess(true);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleShareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DailyOps - Código da Equipe',
          text: `Seu código para entrar na equipe DailyOps é: ${generatedCode}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyCode();
    }
  };

  const handleContinue = () => {
    navigate('/dashboard/manager');
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Cadastro Realizado!</h1>
            <p className="text-gray-600 mt-2">Seu código de equipe foi gerado</p>
          </div>

          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-primary">Código da Sua Equipe</CardTitle>
              <CardDescription>
                Compartilhe este código com seus colaboradores para que eles possam se cadastrar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-primary bg-primary/10 py-4 px-6 rounded-lg">
                  {generatedCode}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleCopyCode}
                  variant="outline"
                  className="flex-1"
                  disabled={codeCopied}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {codeCopied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button 
                  onClick={handleShareCode}
                  variant="outline"
                  className="flex-1"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Importante:</strong> Guarde este código com segurança. 
                  Você pode visualizá-lo novamente no seu painel de controle.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Button 
            onClick={handleContinue}
            className="w-full dailyops-button-primary"
          >
            Continuar para o Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cadastro Manager</h1>
            <p className="text-gray-600">Gerencie sua equipe e atribua tarefas</p>
          </div>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Criar Conta Manager</CardTitle>
            <CardDescription>
              Após o cadastro, você receberá um código único para sua equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="dailyops-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="dailyops-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="dailyops-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="dailyops-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full dailyops-button-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  'Criar Conta Manager'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">Desenvolvido por Triplo H Desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}

