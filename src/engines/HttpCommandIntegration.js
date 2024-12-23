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

      const baseURL = modelParameters.base_url || null;
      const endpoint = modelParameters.endpoint || null;
      const method = modelParameters.method || null;
      const requestId = modelParameters.request_id || `req-${Date.now()}`;

      console.log(modelParameters);
      console.log(baseURL);
      console.log(endpoint);
      console.log(method);

      if (!baseURL || !endpoint || !method) {
        throw new Error('Os parâmetros "baseURL", "endpoint" e "method" são obrigatórios.');
      }

      // Configuração da requisição
      const url = `${baseURL}${endpoint}`;
      const headers = modelParameters.headers || {};
      const timeout = modelParameters.timeout || 5000; // Timeout padrão de 5 segundos
      const params = modelParameters.params || {}; // Parâmetros de query opcionais
      const data = modelParameters.body || {}; // Corpo da requisição

      // Executa a requisição diretamente com axios
      const response = await axios({
        method: method.toLowerCase(),
        url: url,
        headers: headers,
        timeout: timeout,
        params: params,
        data: data
      });

      console.log('Resposta recebida com sucesso:', response.data);
      return {
        request_id: response.data
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
