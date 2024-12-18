const OpenAIIntegration = require('../engines/OpenAIIntegration');
const DallEIntegration = require('../engines/DallEIntegration');
const GeminiIntegration = require('../engines/GeminiIntegration');
const InferenceAPIIntegrationTextToImage = require('../engines/InferenceAPIIntegrationTextToImage');
const InferenceAPIIntegrationTextGeneration = require('../engines/InferenceAPIIntegrationTextGeneration');
const InferenceAPIIntegrationTextToAudio = require('../engines/InferenceAPIIntegrationTextToAudio');
const InferenceAPIIntegrationTextToSpeech = require('../engines/InferenceAPIIntegrationTextToSpeech');
const CURLIntegration = require('../engines/CURLIntegration');
const FreePikTextToImageIntegration = require('../engines/FreePikTextToImageIntegration');
const WritterAIIntegration = require('../engines/WritterAIIntegration');
const BrainstormAIIntegration = require('../engines/BrainstormAIIntegration');
const WordpressIntegration = require('../engines/WordpressIntegration');
const InstagramIntegration = require('../engines/InstagramIntegration');


module.exports = {
  async processPrompt(prompt, engine, model, parametrosModelo) {
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
        case 'inferenceapi-text-to-image':
          integrationClass = InferenceAPIIntegrationTextToImage;
          break;
        case 'inferenceapi-text-generation':
          integrationClass = InferenceAPIIntegrationTextGeneration;
          break;
        case 'inferenceapi-text-to-audio':
          integrationClass = InferenceAPIIntegrationTextToAudio;
          break; 
        case 'inferenceapi-text-to-speech':
          integrationClass = InferenceAPIIntegrationTextToSpeech;
          break;           
        case 'freepikapi-text-to-image':
          integrationClass = FreePikTextToImageIntegration;
          break;      
        case 'writter-ai':
          integrationClass = WritterAIIntegration;
          break;
        case 'brainstorm-ai':
          integrationClass = BrainstormAIIntegration;
          break;
        case 'wordpress':
          integrationClass = WordpressIntegration;
          break;          
        case 'instagram':
          integrationClass = InstagramIntegration;
          break;          
        case 'curl':
          integrationClass = CURLIntegration;
          break;           
        default:
          throw new Error(`Engine não suportada: ${engine}`);
      }
      console.log(integrationClass);
      return await integrationClass.process(prompt, model, parametrosModelo);
    } catch (error) {
      console.error(`Erro na integração com ${engine}:`, error);
      throw error;
    }
  },
};