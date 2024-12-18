const HtmlToImageService = require('../services/HtmlToImageService'); // Ajuste o caminho para a classe HTMLToImageService

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters || {};
      console.log('Iniciando integração com o HTMLToImageService...');

      const apiKey = modelParameters.apiKey || null;
      const username = modelParameters.username || null;

      if (!apiKey || !username) {
        throw new Error('Os parâmetros "apiKey" e "username" são obrigatórios.');
      }

      // Instancia o serviço HTMLToImageService
      const htmlToImageService = new HtmlToImageService(modelParameters.baseURL);

      // Decide qual funcionalidade usar com base nos parâmetros
      if (modelParameters.action === 'generateImage') {
        // Gera uma imagem a partir de HTML
        console.log('Gerando imagem a partir de HTML...');

        if (!modelParameters.html) {
          throw new Error('O parâmetro "html" é obrigatório para gerar uma imagem.');
        }

        const width = modelParameters.width || 1080; // Largura padrão
        const height = modelParameters.height || 1920; // Altura padrão
        const css = modelParameters.css || ''; // CSS adicional (opcional)

        const result = await htmlToImageService.generateImage(
          modelParameters.html,
          username,
          apiKey,
          width,
          height,
          css
        );

        console.log('Imagem gerada com sucesso:', result);
        return result;

      } else {
        throw new Error(
          'Nenhuma ação válida foi especificada. Use "generateImage" em "modelParameters.action".'
        );
      }
    } catch (error) {
      console.error('Erro durante a integração com o HTMLToImageService:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};
