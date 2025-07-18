const axios = require('axios');
const InstagramService = require('../services/InstagramService'); // Ajuste o caminho para a classe InstagramService

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters ? modelParameters : {};
      console.log('Iniciando integração com o Instagram API...');

      const apiKey = modelParameters.api_key || null;

      if (!apiKey) {
        throw new Error('O parâmetro "apiKey" é obrigatório.');
      }

      // Instancia o serviço InstagramService
      const instagramService = new InstagramService(modelParameters.api_base_url);

      // Decide qual funcionalidade usar com base nos parâmetros
      if (modelParameters.action === 'publishPost') {
        // Publica um post no Instagram
        console.log('Publicando um post no Instagram...');
        if (!modelParameters.media_url) {
          throw new Error('O parâmetro "mediaUrl" é obrigatório para publicar um post.');
        }

        const result = await instagramService.publishPost(
          modelParameters.media_url,
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
        if (!modelParameters.video_url) {
          throw new Error('O parâmetro "videoUrl" é obrigatório para publicar um reel.');
        }

        const result = await instagramService.publishReel(
          modelParameters.video_url,
          modelParameters.caption || '',
          apiKey
        );

        console.log('Reel publicado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'publishStory') {
        // Publica um story no Instagram
        console.log('Publicando um story no Instagram...');
        if (!modelParameters.media_url || !modelParameters.media_type) {
          throw new Error(
            'Os parâmetros "mediaUrl" e "mediaType" são obrigatórios para publicar um story.'
          );
        }

        const result = await instagramService.publishStory(
          modelParameters.media_url,
          modelParameters.media_type,
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