const ThreadsService = require('../services/ThreadsService');

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters || {};
      console.log('Iniciando integração com o Threads API...');

      const accessToken = modelParameters.access_token;
      const userId = modelParameters.user_id;

      if (!accessToken || !userId) {
        throw new Error('Os parâmetros "accessToken" e "userId" são obrigatórios.');
      }

      if (modelParameters.action === 'publishPost') {
        console.log('Publicando um post no Threads...');

        const { media_type, text, image_url, video_url } = modelParameters;
        if (!media_type) {
          throw new Error('O parâmetro "mediaType" é obrigatório.');
        }

        const mediaContainerId = await ThreadsService.createMediaContainer(accessToken, userId, {
          media_type,
          text,
          image_url,
          video_url,
        });

        console.log('Esperando 30 segundos para publicar...');
        await new Promise((resolve) => setTimeout(resolve, 30000)); // Aguarda 30 segundos

        const result = await ThreadsService.publishMediaContainer(accessToken, userId, mediaContainerId);
        console.log('Post publicado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'publishCarousel') {
        console.log('Publicando um carrossel no Threads...');

        const { items, text } = modelParameters;
        if (!items || !Array.isArray(items) || items.length < 2) {
          throw new Error('O parâmetro "items" deve ser uma lista de pelo menos dois objetos.');
        }

        const children = [];
        for (const item of items) {
          const childId = await ThreadsService.createMediaContainer(accessToken, userId, {
            ...item,
            is_carousel_item: true,
          });
          children.push(childId);
        }

        const carouselContainerId = await ThreadsService.createCarouselContainer(
          accessToken,
          userId,
          children,
          text
        );

        console.log('Esperando 30 segundos para publicar...');
        await new Promise((resolve) => setTimeout(resolve, 30000)); // Aguarda 30 segundos

        const result = await ThreadsService.publishMediaContainer(accessToken, userId, carouselContainerId);
        console.log('Carrossel publicado com sucesso:', result);
        return result;

      } else {
        throw new Error('Ação inválida. Use "publishPost" ou "publishCarousel".');
      }
    } catch (error) {
      console.error('Erro durante a integração com o Threads API:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};
