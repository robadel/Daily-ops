// Translation service using browser's built-in capabilities
// For production, you would integrate with Google Translate API

class TranslationService {
  constructor() {
    this.cache = new Map();
    this.supportedLanguages = {
      'pt': 'Português',
      'en': 'English'
    };
  }

  // Detect language of text (simplified detection)
  detectLanguage(text) {
    if (!text || text.trim().length === 0) return 'pt';
    
    // Simple heuristic-based language detection
    const portugueseWords = [
      'e', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'não', 'que', 'se', 'o', 'a',
      'tarefa', 'trabalho', 'equipe', 'manager', 'labor', 'concluir', 'pendente', 'criar'
    ];
    
    const englishWords = [
      'the', 'and', 'of', 'to', 'in', 'a', 'is', 'that', 'for', 'with', 'as', 'it', 'on',
      'task', 'work', 'team', 'manager', 'labor', 'complete', 'pending', 'create'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    let ptScore = 0;
    let enScore = 0;
    
    words.forEach(word => {
      if (portugueseWords.includes(word)) ptScore++;
      if (englishWords.includes(word)) enScore++;
    });
    
    return ptScore > enScore ? 'pt' : 'en';
  }

  // Simple translation dictionary for common phrases
  getTranslationDictionary() {
    return {
      'pt-en': {
        // Common UI elements
        'Criar Tarefa': 'Create Task',
        'Nova Tarefa': 'New Task',
        'Editar Tarefa': 'Edit Task',
        'Excluir Tarefa': 'Delete Task',
        'Concluir Tarefa': 'Complete Task',
        'Tarefa Concluída': 'Task Completed',
        'Tarefa Pendente': 'Pending Task',
        'Em Andamento': 'In Progress',
        'Pendente': 'Pending',
        'Concluída': 'Completed',
        'Prioridade Alta': 'High Priority',
        'Prioridade Média': 'Medium Priority',
        'Prioridade Baixa': 'Low Priority',
        'Minha Equipe': 'My Team',
        'Membros da Equipe': 'Team Members',
        'Código da Equipe': 'Team Code',
        'Manager': 'Manager',
        'Labor': 'Labor',
        'Dashboard': 'Dashboard',
        'Configurações': 'Settings',
        'Perfil': 'Profile',
        'Sair': 'Logout',
        'Entrar': 'Login',
        'Cadastrar': 'Register',
        'Nome': 'Name',
        'Email': 'Email',
        'Senha': 'Password',
        'Confirmar Senha': 'Confirm Password',
        'Título': 'Title',
        'Descrição': 'Description',
        'Data Limite': 'Due Date',
        'Atribuir para': 'Assign to',
        'Buscar': 'Search',
        'Filtrar': 'Filter',
        'Todas': 'All',
        'Salvar': 'Save',
        'Cancelar': 'Cancel',
        'Sim': 'Yes',
        'Não': 'No',
        'Sucesso': 'Success',
        'Erro': 'Error',
        'Carregando': 'Loading',
        'Desenvolvido por': 'Developed by'
      },
      'en-pt': {
        // Reverse mapping
        'Create Task': 'Criar Tarefa',
        'New Task': 'Nova Tarefa',
        'Edit Task': 'Editar Tarefa',
        'Delete Task': 'Excluir Tarefa',
        'Complete Task': 'Concluir Tarefa',
        'Task Completed': 'Tarefa Concluída',
        'Pending Task': 'Tarefa Pendente',
        'In Progress': 'Em Andamento',
        'Pending': 'Pendente',
        'Completed': 'Concluída',
        'High Priority': 'Prioridade Alta',
        'Medium Priority': 'Prioridade Média',
        'Low Priority': 'Prioridade Baixa',
        'My Team': 'Minha Equipe',
        'Team Members': 'Membros da Equipe',
        'Team Code': 'Código da Equipe',
        'Manager': 'Manager',
        'Labor': 'Labor',
        'Dashboard': 'Dashboard',
        'Settings': 'Configurações',
        'Profile': 'Perfil',
        'Logout': 'Sair',
        'Login': 'Entrar',
        'Register': 'Cadastrar',
        'Name': 'Nome',
        'Email': 'Email',
        'Password': 'Senha',
        'Confirm Password': 'Confirmar Senha',
        'Title': 'Título',
        'Description': 'Descrição',
        'Due Date': 'Data Limite',
        'Assign to': 'Atribuir para',
        'Search': 'Buscar',
        'Filter': 'Filtrar',
        'All': 'Todas',
        'Save': 'Salvar',
        'Cancel': 'Cancelar',
        'Yes': 'Sim',
        'No': 'Não',
        'Success': 'Sucesso',
        'Error': 'Erro',
        'Loading': 'Carregando',
        'Developed by': 'Desenvolvido por'
      }
    };
  }

  // Translate text using dictionary or fallback
  async translateText(text, fromLang, toLang) {
    if (!text || text.trim().length === 0) return text;
    if (fromLang === toLang) return text;

    const cacheKey = `${fromLang}-${toLang}-${text}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const dictionary = this.getTranslationDictionary();
      const translationKey = `${fromLang}-${toLang}`;
      
      if (dictionary[translationKey] && dictionary[translationKey][text]) {
        const translation = dictionary[translationKey][text];
        this.cache.set(cacheKey, translation);
        return translation;
      }

      // For production, integrate with Google Translate API here
      // For now, return original text with a note
      const fallbackTranslation = `[${toLang.toUpperCase()}] ${text}`;
      this.cache.set(cacheKey, fallbackTranslation);
      return fallbackTranslation;

    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  }

  // Auto-translate between Portuguese and English
  async autoTranslate(text) {
    const detectedLang = this.detectLanguage(text);
    const targetLang = detectedLang === 'pt' ? 'en' : 'pt';
    
    return {
      originalText: text,
      originalLang: detectedLang,
      translatedText: await this.translateText(text, detectedLang, targetLang),
      translatedLang: targetLang
    };
  }

  // Clear translation cache
  clearCache() {
    this.cache.clear();
  }

  // Get supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }
}

// Create singleton instance
const translationService = new TranslationService();

export default translationService;

