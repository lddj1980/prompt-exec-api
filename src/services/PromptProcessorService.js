const OpenAIIntegration = require('../engines/OpenAIIntegration');
const DallEIntegration = require('../engines/DallEIntegration');
const GeminiIntegration = require('../engines/GeminiIntegration');
const InferenceAPIIntegrationTextToImage = require('../engines/InferenceAPIIntegrationTextToImage');
const InferenceAPIIntegrationTextGeneration = require('../engines/InferenceAPIIntegrationTextGeneration');
const InferenceAPIIntegrationTextToAudio = require('../engines/InferenceAPIIntegrationTextToAudio');
const InferenceAPIIntegrationTextToSpeech = require('../engines/InferenceAPIIntegrationTextToSpeech');
const FreePikTextToImageIntegration = require('../engines/FreePikTextToImageIntegration');
const WritterAIIntegration = require('../engines/WritterAIIntegration');
const BrainstormAIIntegration = require('../engines/BrainstormAIIntegration');
const WordpressIntegration = require('../engines/WordpressIntegration');
const InstagramIntegration = require('../engines/InstagramIntegration');
const WhatsappIntegration = require('../engines/WhatsappIntegration');
const TelegramIntegration = require('../engines/TelegramIntegration');
const CarouselIntegration = require('../engines/CarouselIntegration');
const ImageRepoIntegration = require('../engines/ImageRepoIntegration');
const HtmlToImageIntegration = require('../engines/HtmlToImageIntegration');
const ElevenLabsTextToSpeechIntegration = require('../engines/ElevenLabsTextToSpeechIntegration');
const HttpCommandIntegration = require('../engines/HttpCommandIntegration');
const ThreadsIntegration = require('../engines/ThreadsIntegration');
const SendEmailIntegration = require('../engines/SendEmailIntegration');
const ReadEmailIntegration = require('../engines/ReadEmailIntegration');

module.exports = {
  async processPrompt(prompt, engine, model, parametrosModelo) {
    try {
      console.log(`Processando com ${engine} - ${model}`);

      let integrationClass;

      switch (engine.toLowerCase()) {
        case 'brainstorm-ai':
          integrationClass = BrainstormAIIntegration;
          break;
        case 'carousel':
          integrationClass = CarouselIntegration;
          break;           
        case 'dall-e':
          integrationClass = DallEIntegration;
          break;
        case 'elevenlabs-text-to-speech':
          integrationClass = ElevenLabsTextToSpeechIntegration;
          break;          
        case 'send-email':
          integrationClass = SendEmailIntegration;
          break;                    
        case 'freepikapi-text-to-image':
          integrationClass = FreePikTextToImageIntegration;
          break;      
        case 'gemini':
          integrationClass = GeminiIntegration;
          break;
        case 'html-to-image':
          integrationClass = HtmlToImageIntegration;
          break;
        case 'http-command':
          integrationClass = HttpCommandIntegration;
          break;          
        case 'image-repo':
          integrationClass = ImageRepoIntegration;
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
        case 'instagram':
          integrationClass = InstagramIntegration;
          break;    
        case 'openai':
          integrationClass = OpenAIIntegration;
          break;
        case 'read-email':
          integrationClass = ReadEmailIntegration;
          break;                    
        case 'telegram':
          integrationClass = TelegramIntegration;
          break; 
        case 'threads':
          integrationClass = ThreadsIntegration;
          break; 
        case 'whatsapp':
          integrationClass = WhatsappIntegration;
          break; 
        case 'wordpress':
          integrationClass = WordpressIntegration;
          break;          
        case 'writter-ai':
          integrationClass = WritterAIIntegration;
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