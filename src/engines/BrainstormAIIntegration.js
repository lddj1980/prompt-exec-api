const axios = require('axios');
const BrainstormAIService = require('../services/BrainstormAIService'); // Ajuste o caminho para a classe BrainstormAIService

module.exports = {
  async process(prompt, modelo, parametros_modelo) {
    try {
      parametros_modelo = parametros_modelo ? parametros_modelo : {};
      console.log('Iniciando integração com o Brainstorm AI...');

      const apiKey = parametros_modelo.api_key || null;

      if (!apiKey) {
        throw new Error('O parâmetro "apiKey" é obrigatório.');
      }

      // Instancia o serviço BrainstormAIService
      const brainstormAIService = new BrainstormAIService();

      // Decide qual funcionalidade usar com base nos parâmetros
      if (parametros_modelo.action === 'execute') {
        // Executa o script Brainstorm
        console.log('Executando script Brainstorm...');
        if (!parametros_modelo.writer_id) {
          throw new Error('O parâmetro "writerId" é obrigatório para executar o script.');
        }

        const result = await brainstormAIService.execute(apiKey, parametros_modelo.writer_id);

        console.log('Script Brainstorm executado com sucesso:', result);
        return result;

      } else if (parametros_modelo.action === 'getLastTitles') {
        // Obtém os últimos 10 títulos de um redator
        console.log('Obtendo os últimos 10 títulos do redator...');
        if (!parametros_modelo.writer_id) {
          throw new Error('O parâmetro "writerId" é obrigatório para obter os títulos.');
        }

        const lastTitles = await brainstormAIService.getLastTitles(apiKey, parametros_modelo.writer_id);

        console.log('Últimos títulos obtidos com sucesso:', lastTitles);
        return lastTitles;

      } else if (parametros_modelo.action === 'createTitles') {
        // Cria novos títulos e associa ao brainstorm
        console.log('Criando novos títulos...');
        if (!parametros_modelo.writer_id || !parametros_modelo.titles) {
          throw new Error(
            'Os parâmetros "writerId" e "titles" são obrigatórios para criar títulos.'
          );
        }

        const createdTitles = await brainstormAIService.createTitles(
          apiKey,
          parametros_modelo.writer_id,
          parametros_modelo.titles
        );

        console.log('Novos títulos criados com sucesso:', createdTitles);
        return createdTitles;

      } else {
        throw new Error(
          'Nenhuma ação válida foi especificada. Use "execute", "getLastTitles" ou "createTitles" em "parametros_modelo.action".'
        );
      }

    } catch (error) {
      console.error('Erro durante a integração com o Brainstorm AI:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};
