import React, { useState } from 'react';

const VoiceTextConverter = ({ 
  text, 
  onTextChange, 
  language = 'pt', 
  size = 'md',
  showSpeechToText = false,
  showTextToSpeech = true,
  showTranslate = false 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  // Text-to-Speech
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'pt' ? 'pt-BR' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Seu navegador não suporta síntese de voz');
    }
  };

  // Speech-to-Text
  const handleListen = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = language === 'pt' ? 'pt-BR' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onTextChange) {
          onTextChange(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        alert('Erro no reconhecimento de voz');
      };

      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      alert('Seu navegador não suporta reconhecimento de voz');
    }
  };

  // Simple translation (PT <-> EN)
  const handleTranslate = async () => {
    if (!text.trim()) return;

    setIsTranslating(true);
    try {
      // Simple translation logic (you can integrate with Google Translate API)
      const targetLang = language === 'pt' ? 'en' : 'pt';
      
      // For demo purposes, using a simple dictionary approach
      // In production, you would use Google Translate API
      const translations = {
        // Portuguese to English
        'pt-en': {
          'tarefa': 'task',
          'pendente': 'pending',
          'em andamento': 'in progress',
          'concluída': 'completed',
          'alta': 'high',
          'média': 'medium',
          'baixa': 'low',
          'comentário': 'comment',
          'descrição': 'description',
          'título': 'title'
        },
        // English to Portuguese
        'en-pt': {
          'task': 'tarefa',
          'pending': 'pendente',
          'in progress': 'em andamento',
          'completed': 'concluída',
          'high': 'alta',
          'medium': 'média',
          'low': 'baixa',
          'comment': 'comentário',
          'description': 'descrição',
          'title': 'título'
        }
      };

      const translationKey = language === 'pt' ? 'pt-en' : 'en-pt';
      const dictionary = translations[translationKey];
      
      let translated = text.toLowerCase();
      Object.keys(dictionary).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        translated = translated.replace(regex, dictionary[key]);
      });

      // Capitalize first letter
      translated = translated.charAt(0).toUpperCase() + translated.slice(1);
      
      setTranslatedText(translated);
      
      // Auto-speak the translation
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(translated);
        utterance.lang = targetLang === 'pt' ? 'pt-BR' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Erro na tradução');
    } finally {
      setIsTranslating(false);
    }
  };

  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center space-x-2">
      {/* Speech-to-Text */}
      {showSpeechToText && (
        <button
          onClick={handleListen}
          disabled={isListening}
          className={`${buttonSize} flex items-center justify-center rounded-full ${
            isListening 
              ? 'bg-red-100 text-red-600 animate-pulse' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } transition-colors`}
          title={language === 'pt' ? 'Falar para texto' : 'Speech to text'}
        >
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}

      {/* Text-to-Speech */}
      {showTextToSpeech && text && (
        <button
          onClick={handleSpeak}
          disabled={!text.trim()}
          className={`${buttonSize} flex items-center justify-center rounded-full ${
            isSpeaking 
              ? 'bg-blue-100 text-blue-600 animate-pulse' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } transition-colors`}
          title={language === 'pt' ? 'Ler em voz alta' : 'Read aloud'}
        >
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a1 1 0 01-1-1V8a1 1 0 011-1h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V12a1 1 0 01-1 1H9z" />
          </svg>
        </button>
      )}

      {/* Translate */}
      {showTranslate && text && (
        <button
          onClick={handleTranslate}
          disabled={isTranslating || !text.trim()}
          className={`${buttonSize} flex items-center justify-center rounded-full ${
            isTranslating 
              ? 'bg-green-100 text-green-600 animate-spin' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } transition-colors`}
          title={language === 'pt' ? 'Traduzir' : 'Translate'}
        >
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </button>
      )}

      {/* Translation Result */}
      {translatedText && (
        <div className="ml-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{translatedText}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceTextConverter;

