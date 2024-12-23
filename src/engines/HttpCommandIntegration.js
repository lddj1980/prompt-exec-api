const axios = require('axios');

module.exports = {
  /**
   * Processa uma requisição para a API genérica.
   * @param {string} prompt - Dados ou informações principais para a requisição.
   * @param {string} model - Modelo utilizado para a requisição.
   * @param {Object} modelParameters - Parâmetros para configurar a requisição.
   * @returns {Promise<Object>} - Resposta da API no formato { request_id, data }.
   */
  async process(prompt, model, modelParameters = {}) {
    try {
      console.log(`Iniciando requisição com o modelo ${model}...`);

      const baseURL = modelParameters.baseURL || null;
      const endpoint = modelParameters.endpoint || null;
      const method = modelParameters.method || null;
      const requestId = modelParameters.request_id || `req-${Date.now()}`;

      if (!baseURL || !endpoint || !method) {
        throw new Error('Os parâmetros "baseURL", "endpoint" e "method" são obrigatórios.');
      }

      // Configuração do cliente Axios
      const axiosInstance = axios.create({
        baseURL: baseURL,
        headers: modelParameters.headers || {},
        timeout: modelParameters.timeout || 5000 // Timeout padrão de 5 segundos
      });

      const config = {
        method: method.toLowerCase(),
        url: endpoint,
        params: modelParameters.params || null, // Parâmetros de query opcionais
        data: modelParameters.body || { prompt, model } // Corpo da requisição
      };

      // Executa a requisição
      const response = await axiosInstance(config);

      console.log('Resposta recebida com sucesso:', response.data);
      return {
        request_id: requestId,
        data: response.data
      };
    } catch (error) {
      console.error('Erro durante a requisição:', error.message);

      if (error.response) {
        console.error('Detalhes do erro na resposta:', error.response.data);
        throw new Error(error.response.data.message || 'Erro na API.');
      } else if (error.request) {
        console.error('Erro durante o envio da requisição:', error.request);
        throw new Error('Erro na comunicação com a API.');
      } else {
        console.error('Erro inesperado:', error.message);
        throw new Error(error.message);
      }
    }
  }
};
