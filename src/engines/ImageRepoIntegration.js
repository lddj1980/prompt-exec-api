const ImageRepoAPI = require('../services/ImageRepoAPI'); // Ajuste o caminho para a classe ImageRepoAPI

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters || {};
      console.log('Iniciando integração com o Image Repo API...');

      const apiKey = modelParameters.apiKey || null;

      if (!apiKey) {
        throw new Error('O parâmetro "apiKey" é obrigatório.');
      }

      // Instancia o serviço ImageRepoAPI
      const imageRepoAPI = new ImageRepoAPI(modelParameters.baseURL);

      // Decide qual funcionalidade usar com base nos parâmetros
      if (modelParameters.action === 'createImage') {
        // Cria uma imagem no repositório
        console.log('Criando imagem no repositório...');

        if (
          !modelParameters.imageUrl ||
          !modelParameters.metadata ||
          !modelParameters.extension ||
          !modelParameters.ftpConfigId
        ) {
          throw new Error(
            'Os parâmetros "imageUrl", "metadata", "extension" e "ftpConfigId" são obrigatórios para criar uma imagem.'
          );
        }

        const metadata = {
          description: modelParameters.metadata.description || '',
          tags: modelParameters.metadata.tags || [],
        };

        const result = await imageRepoAPI.createImage(
          modelParameters.imageUrl,
          metadata,
          modelParameters.extension,
          apiKey,
          modelParameters.ftpConfigId,
          modelParameters.base64 || false
        );

        console.log('Imagem criada com sucesso:', result);
        return result;

      } else {
        throw new Error(
          'Nenhuma ação válida foi especificada. Use "createImage" em "modelParameters.action".'
        );
      }
    } catch (error) {
      console.error('Erro durante a integração com o Image Repo API:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};