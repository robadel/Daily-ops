import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCheck, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function LaborRegisterPage() {
  const navigate = useNavigate();
  const { registerLabor, error, loading, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    managerCode: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeValidation, setCodeValidation] = useState({
    isValidating: false,
    isValid: null,
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase() // Manager codes are uppercase
    }));
    
    if (error) clearError();
    
    // Reset code validation when code changes
    if (name === 'managerCode') {
      setCodeValidation({
        isValidating: false,
        isValid: null,
        message: ''
      });
    }
  };

  const validateManagerCode = async (code) => {
    if (!code || code.length !== 6) {
      setCodeValidation({
        isValidating: false,
        isValid: false,
        message: 'O código deve ter 6 caracteres'
      });
      return;
    }

    setCodeValidation({
      isValidating: true,
      isValid: null,
      message: 'Validando código...'
    });

    try {
      // Simulate API call to validate code
      // In real implementation, this would check Firebase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any 6-character code
      setCodeValidation({
        isValidating: false,
        isValid: true,
        message: 'Código válido!'
      });
    } catch (err) {
      setCodeValidation({
        isValidating: false,
        isValid: false,
        message: 'Código inválido ou não encontrado'
      });
    }
  };

  const handleCodeBlur = () => {
    if (formData.managerCode.trim()) {
      validateManagerCode(formData.managerCode.trim());
    }
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

    if (!formData.managerCode.trim() || formData.managerCode.length !== 6) {
      return;
    }

    const result = await registerLabor(
      formData.email,
      formData.password,
      formData.name,
      formData.managerCode
    );

    if (result.success) {
      navigate('/dashboard/labor');
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Cadastro Labor</h1>
            <p className="text-gray-600">Receba e execute tarefas da sua equipe</p>
          </div>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-accent" />
            </div>
            <CardTitle>Criar Conta Labor</CardTitle>
            <CardDescription>
              Você precisa do código fornecido pelo seu Manager para se cadastrar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Manager Code Field - First for better UX */}
              <div className="space-y-2">
                <Label htmlFor="managerCode">Código do Manager</Label>
                <div className="relative">
                  <Input
                    id="managerCode"
                    name="managerCode"
                    type="text"
                    placeholder="Digite o código de 6 caracteres"
                    value={formData.managerCode}
                    onChange={handleInputChange}
                    onBlur={handleCodeBlur}
                    required
                    maxLength={6}
                    className={`dailyops-input pr-10 font-mono text-center text-lg tracking-wider ${
                      codeValidation.isValid === true ? 'border-green-500' : 
                      codeValidation.isValid === false ? 'border-red-500' : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {codeValidation.isValidating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                    {codeValidation.isValid === true && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {codeValidation.isValid === false && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                {codeValidation.message && (
                  <p className={`text-sm ${
                    codeValidation.isValid === true ? 'text-green-600' : 
                    codeValidation.isValid === false ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {codeValidation.message}
                  </p>
                )}
              </div>

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

              <Alert>
                <AlertDescription>
                  <strong>Importante:</strong> Solicite o código de 6 caracteres ao seu Manager 
                  para poder se cadastrar na equipe.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full dailyops-button-primary"
                disabled={loading || codeValidation.isValid !== true}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  'Criar Conta Labor'
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

