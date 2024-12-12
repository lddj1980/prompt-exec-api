const OpenAIIntegration = require('../engines/OpenAIIntegration');
const DallEIntegration = require('../engines/DallEIntegration');
const GeminiIntegration = require('../engines/GeminiIntegration');
const InferenceAPIIntegration = require('../engines/InferenceAPIIntegration');

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
        case 'inferenceapi':
          integrationClass = InferenceAPIIntegration;
          break;
        default:
          throw new Error(`Engine não suportada: ${engine}`);
      }
      console.log(integrationClass);
      return await integrationClass.process(prompt, model);
    } catch (error) {
      console.error(`Erro na integração com ${engine}:`, error);
      throw error;
    }
  },
};