// Audio service for voice recording, playback, and text-to-speech

class AudioService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.isPlaying = false;
    this.currentAudio = null;
    this.speechSynthesis = window.speechSynthesis;
    this.recognition = null;
    
    // Initialize speech recognition if available
    this.initializeSpeechRecognition();
  }

  // Initialize Web Speech API for speech recognition
  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new window.SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'pt-BR'; // Default to Portuguese
    }
  }

  // Check if audio recording is supported
  isRecordingSupported() {
    return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  }

  // Check if speech recognition is supported
  isSpeechRecognitionSupported() {
    return this.recognition !== null;
  }

  // Check if text-to-speech is supported
  isTextToSpeechSupported() {
    return 'speechSynthesis' in window;
  }

  // Start audio recording
  async startRecording() {
    if (!this.isRecordingSupported()) {
      throw new Error('Audio recording not supported in this browser');
    }

    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      return {
        success: true,
        message: 'Recording started'
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Stop audio recording
  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No recording in progress');
    }

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Stop all tracks to release microphone
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        this.isRecording = false;
        this.mediaRecorder = null;

        resolve({
          success: true,
          audioBlob,
          audioUrl,
          duration: this.audioChunks.length // Approximate duration
        });
      };

      this.mediaRecorder.stop();
    });
  }

  // Play audio from URL or blob
  async playAudio(audioSource) {
    if (this.isPlaying) {
      this.stopAudio();
    }

    try {
      this.currentAudio = new Audio(audioSource);
      
      return new Promise((resolve, reject) => {
        this.currentAudio.onloadeddata = () => {
          this.isPlaying = true;
          this.currentAudio.play();
        };

        this.currentAudio.onended = () => {
          this.isPlaying = false;
          this.currentAudio = null;
          resolve({
            success: true,
            message: 'Audio playback completed'
          });
        };

        this.currentAudio.onerror = (error) => {
          this.isPlaying = false;
          this.currentAudio = null;
          reject({
            success: false,
            error: 'Audio playback failed'
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Stop audio playback
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isPlaying = false;
    }
  }

  // Convert speech to text
  async speechToText(language = 'pt-BR') {
    if (!this.isSpeechRecognitionSupported()) {
      throw new Error('Speech recognition not supported in this browser');
    }

    this.recognition.lang = language;

    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        resolve({
          success: true,
          transcript,
          confidence,
          language
        });
      };

      this.recognition.onerror = (event) => {
        reject({
          success: false,
          error: event.error,
          message: 'Speech recognition failed'
        });
      };

      this.recognition.onend = () => {
        // Recognition ended
      };

      this.recognition.start();
    });
  }

  // Convert text to speech
  async textToSpeech(text, options = {}) {
    if (!this.isTextToSpeechSupported()) {
      throw new Error('Text-to-speech not supported in this browser');
    }

    // Stop any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.lang = options.lang || 'pt-BR';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Get available voices
    const voices = this.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        resolve({
          success: true,
          message: 'Text-to-speech completed'
        });
      };

      utterance.onerror = (event) => {
        reject({
          success: false,
          error: event.error,
          message: 'Text-to-speech failed'
        });
      };

      this.speechSynthesis.speak(utterance);
    });
  }

  // Stop text-to-speech
  stopTextToSpeech() {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
  }

  // Get available voices for text-to-speech
  getAvailableVoices() {
    if (!this.isTextToSpeechSupported()) {
      return [];
    }

    return this.speechSynthesis.getVoices().map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService
    }));
  }

  // Convert audio blob to base64 for storage
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Convert base64 to blob
  base64ToBlob(base64, mimeType = 'audio/webm') {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Clean up resources
  cleanup() {
    this.stopAudio();
    this.stopTextToSpeech();
    
    if (this.isRecording) {
      this.stopRecording();
    }
  }
}

// Create singleton instance
const audioService = new AudioService();

export default audioService;

