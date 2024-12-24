const ThreadsService = require('../services/ThreadsService'); // Ajuste o caminho para a ThreadsService

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters || {};
      console.log('Iniciando integração com o Threads API...');

      const accessToken = modelParameters.access_token || null;

      if (!accessToken) {
        throw new Error('O parâmetro "accessToken" é obrigatório.');
      }

      // Decide qual funcionalidade usar com base nos parâmetros
      if (modelParameters.action === 'publishPost') {
        // Publica um post no Threads
        console.log('Publicando um post no Threads...');
        if (!modelParameters.message) {
          throw new Error('O parâmetro "message" é obrigatório para publicar um post.');
        }

        const threadId = modelParameters.thread_id || null; // Para responder a uma thread existente (opcional)

        const result = await ThreadsService.publishPost(
          accessToken,
          modelParameters.message,
          threadId
        );

        console.log('Post publicado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'getUserPosts') {
        // Obtém as postagens de um usuário no Threads
        console.log('Obtendo postagens de um usuário no Threads...');
        if (!modelParameters.user_id) {
          throw new Error('O parâmetro "userId" é obrigatório para obter as postagens.');
        }

        const result = await ThreadsService.getUserPosts(
          accessToken,
          modelParameters.user_id
        );

        console.log('Postagens obtidas com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'deletePost') {
        // Deleta um post no Threads
        console.log('Deletando um post no Threads...');
        if (!modelParameters.thread_id) {
          throw new Error('O parâmetro "threadId" é obrigatório para deletar um post.');
        }

        const result = await ThreadsService.deletePost(
          accessToken,
          modelParameters.thread_id
        );

        console.log('Post deletado com sucesso:', result);
        return result;

      } else {
        throw new Error(
          'Nenhuma ação válida foi especificada. Use "publishPost", "getUserPosts" ou "deletePost" em "modelParameters.action".'
        );
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