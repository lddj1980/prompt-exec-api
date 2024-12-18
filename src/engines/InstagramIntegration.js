const axios = require('axios');
const InstagramService = require('../services/InstagramService'); // Ajuste o caminho para a classe InstagramService

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters ? modelParameters : {};
      console.log('Iniciando integração com o Instagram API...');

      const apiKey = modelParameters.apiKey || null;

      if (!apiKey) {
        throw new Error('O parâmetro "apiKey" é obrigatório.');
      }

      // Instancia o serviço InstagramService
      const instagramService = new InstagramService(modelParameters.apiBaseUrl);

      // Decide qual funcionalidade usar com base nos parâmetros
      if (modelParameters.action === 'publishPost') {
        // Publica um post no Instagram
        console.log('Publicando um post no Instagram...');
        if (!modelParameters.mediaUrl) {
          throw new Error('O parâmetro "mediaUrl" é obrigatório para publicar um post.');
        }

        const result = await instagramService.publishPost(
          modelParameters.mediaUrl,
          modelParameters.caption || '',
          apiKey
        );

        console.log('Post publicado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'publishCarousel') {
        // Publica um carrossel no Instagram
        console.log('Publicando um carrossel no Instagram...');
        if (!modelParameters.slides || !Array.isArray(modelParameters.slides)) {
          throw new Error('O parâmetro "slides" deve ser uma lista de URLs para publicar um carrossel.');
        }

        const result = await instagramService.publishCarousel(
          modelParameters.slides,
          modelParameters.caption || '',
          apiKey
        );

        console.log('Carrossel publicado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'publishReel') {
        // Publica um reel no Instagram
        console.log('Publicando um reel no Instagram...');
        if (!modelParameters.videoUrl) {
          throw new Error('O parâmetro "videoUrl" é obrigatório para publicar um reel.');
        }

        const result = await instagramService.publishReel(
          modelParameters.videoUrl,
          modelParameters.caption || '',
          apiKey
        );

        console.log('Reel publicado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'publishStory') {
        // Publica um story no Instagram
        console.log('Publicando um story no Instagram...');
        if (!modelParameters.mediaUrl || !modelParameters.mediaType) {
          throw new Error(
            'Os parâmetros "mediaUrl" e "mediaType" são obrigatórios para publicar um story.'
          );
        }

        const result = await instagramService.publishStory(
          modelParameters.mediaUrl,
          modelParameters.mediaType,
          modelParameters.caption || '',
          apiKey
        );

        console.log('Story publicado com sucesso:', result);
        return result;

      } else {
        throw new Error(
          'Nenhuma ação válida foi especificada. Use "publishPost", "publishCarousel", "publishReel" ou "publishStory" em "modelParameters.action".'
        );
      }
    } catch (error) {
      console.error('Erro durante a integração com o Instagram API:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};