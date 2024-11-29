const OpenAIIntegration = require('../engines/OpenAIIntegration');
const DallEIntegration = require('../engines/DallEIntegration');
const GeminiIntegration = require('../engines/GeminiIntegration');

module.exports = {
  async processPrompt(prompt, engine, model) {
    try {
      console.log(`Processando com ${engine} - ${model}`);

      let integrationClass;

      switch (engine.toLowerCase()) {
        case 'openai':
          integrationClass = OpenAIIntegration;
          break;
        case 'dall-e':
          integrationClass = DallEIntegration;
          break;
        case 'gemini':
          integrationClass = GeminiIntegration;
          break;
        default:
          throw new Error(`Engine não suportada: ${engine}`);
      }

      return await integrationClass.process(prompt, model);
    } catch (error) {
      console.error(`Erro na integração com ${engine}:`, error);
      throw error;
    }
  },
};