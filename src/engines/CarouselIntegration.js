const CarouselService = require('../services/CarouselService'); // Ajuste o caminho para a classe CarouselService

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters || {};
      console.log('Iniciando integração com o Carousel API...');

      const apiKey = modelParameters.apiKey || null;

      if (!apiKey) {
        throw new Error('O parâmetro "apiKey" é obrigatório.');
      }

      // Instancia o serviço CarouselService
      const carouselService = new CarouselService(modelParameters.baseURL);

      // Decide qual funcionalidade usar com base nos parâmetros
      if (modelParameters.action === 'generateCarousel') {
        // Gera um carousel
        console.log('Gerando carousel...');
        if (!modelParameters.payload) {
          throw new Error('O parâmetro "payload" é obrigatório para gerar um carousel.');
        }

        const result = await carouselService.generateCarousel(apiKey, modelParameters.payload);

        console.log('Carousel gerado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'getProgress') {
        // Consulta o progresso da geração de um carousel
        console.log('Consultando progresso do carousel...');
        if (!modelParameters.progressId) {
          throw new Error('O parâmetro "progressId" é obrigatório para consultar o progresso.');
        }

        const result = await carouselService.getProgress(apiKey, modelParameters.progressId);

        console.log('Progresso consultado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'getCarousel') {
        // Consulta as imagens de um carousel gerado
        console.log('Consultando carousel gerado...');
        if (!modelParameters.carouselId) {
          throw new Error('O parâmetro "carouselId" é obrigatório para consultar o carousel.');
        }

        const result = await carouselService.getCarousel(apiKey, modelParameters.carouselId);

        console.log('Carousel consultado com sucesso:', result);
        return result;

      } else {
        throw new Error(
          'Nenhuma ação válida foi especificada. Use "generateCarousel", "getProgress" ou "getCarousel" em "modelParameters.action".'
        );
      }
    } catch (error) {
      console.error('Erro durante a integração com o Carousel API:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};
