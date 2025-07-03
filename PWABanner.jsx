import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Bell,
  CheckCircle
} from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export default function PWABanner() {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    installApp,
    updateApp,
    requestNotificationPermission,
    getInstallInstructions,
    capabilities
  } = usePWA();

  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [showUpdateBanner, setShowUpdateBanner] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);
    
    if (success) {
      setShowInstallBanner(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateApp();
    setIsUpdating(false);
    setShowUpdateBanner(false);
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
  };

  const installInstructions = getInstallInstructions();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-4">
      {/* Offline Banner */}
      {!isOnline && showOfflineBanner && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-800">
                Você está offline. Algumas funcionalidades podem estar limitadas.
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOfflineBanner(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Update Available Banner */}
      {updateAvailable && showUpdateBanner && (
        <Alert className="bg-blue-50 border-blue-200">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-800">
                Nova versão disponível! Atualize para obter as últimas funcionalidades.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar'
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpdateBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Install Banner */}
      {isInstallable && showInstallBanner && !isInstalled && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Instalar DailyOps</h3>
                  <p className="text-xs opacity-90">
                    Acesse rapidamente e use offline
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  {isInstalling ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Instalando...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-1" />
                      Instalar
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstallBanner(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Permission Banner */}
      {capabilities.notifications && 
       notificationPermission === 'default' && 
       isInstalled && (
        <Alert className="bg-green-50 border-green-200">
          <Bell className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-800">
                Ative as notificações para receber atualizações de tarefas
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleRequestNotifications}
                className="bg-green-600 hover:bg-green-700"
              >
                <Bell className="h-3 w-3 mr-1" />
                Ativar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationPermission('denied')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* PWA Status Indicator */}
      {isInstalled && (
        <div className="fixed bottom-4 right-4">
          <Badge 
            variant="secondary" 
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            App Instalado
          </Badge>
        </div>
      )}

      {/* Connection Status */}
      <div className="fixed bottom-4 left-4">
        <Badge 
          variant={isOnline ? "secondary" : "destructive"}
          className={isOnline ? "bg-green-100 text-green-800 border-green-200" : ""}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </>
          )}
        </Badge>
      </div>
    </div>
  );
}

