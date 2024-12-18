const axios = require('axios');
const WritterAiService = require('./services/WritterAiService'); // Ajuste o caminho para a classe WritterAiAPI

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters ? modelParameters : {};
      console.log('Iniciando integração com o Writter-IA...');

      const writerId = modelParameters.writerId || null;
      const apiKey = modelParameters.apiKey || null;

      if (!writerId || !apiKey) {
        throw new Error('Os parâmetros "writerId" e "apiKey" são obrigatórios.');
      }

      // Instancia o serviço WritterAiAPI
      const writterAiAPI = new WritterAiService();

      // Decide qual funcionalidade usar com base nos parâmetros
      if (modelParameters.action === 'getOldestUnusedTitle') {
        // Obtém o título mais antigo não utilizado
        console.log('Buscando o título mais antigo não utilizado...');
        const oldestTitle = await writterAiAPI.getOldestUnusedTitle(writerId, apiKey);

        console.log('Título obtido com sucesso:', oldestTitle);
        return oldestTitle;

      } else if (modelParameters.action === 'generateContent') {
        // Gera conteúdo baseado no título mais antigo
        console.log('Gerando conteúdo...');
        const generatedContent = await writterAiAPI.generateContent(writerId, apiKey);

        console.log('Conteúdo gerado com sucesso:', generatedContent);
        return generatedContent;

      } else if (modelParameters.action === 'savePublication') {
        // Salva a publicação associada ao título
        console.log('Salvando publicação...');

        if (!modelParameters.tituloId || !modelParameters.conteudo) {
          throw new Error(
            'Os parâmetros "tituloId" e "conteudo" são obrigatórios para salvar a publicação.'
          );
        }

        const savedPublication = await writterAiAPI.savePublication(
          writerId,
          apiKey,
          modelParameters.tituloId,
          modelParameters.conteudo
        );

        console.log('Publicação salva com sucesso:', savedPublication);
        return savedPublication;

      } else {
        throw new Error(
          'Nenhuma ação válida foi especificada. Use "getOldestUnusedTitle", "generateContent" ou "savePublication" em "modelParameters.action".'
        );
      }

    } catch (error) {
      console.error('Erro durante a integração com o Writter-IA:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};
