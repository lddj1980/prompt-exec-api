const axios = require('axios'); // Importa axios

module.exports = {
  /**
   * Processa um comando CURL contido na variável "prompt" e o executa usando axios.
   * @param {string} prompt - O comando CURL a ser processado.
   * @param {string} model - Parâmetro ignorado.
   * @param {object} modelParameters - Parâmetro ignorado.
   * @returns {Promise<object>} - A resposta da execução do comando CURL.
   */
  async process(prompt, model, modelParameters = {}) {
    try {
      console.log('Comando CURL recebido:', prompt);

      // Carrega o curlconverter dinamicamente (importação ESM)
      const { toNode } = await import('curlconverter');

      // Converte o comando CURL para código Node.js usando curlconverter
      const nodeCode = toNode(prompt);

      // Extrai os parâmetros necessários (método, URL, headers e corpo) do código gerado
      const config = extrairConfiguracao(nodeCode);

      console.log('Configuração convertida:', config);

      // Executa a requisição HTTP com axios usando os parâmetros extraídos
      const response = await axios({
        method: config.method || 'get',
        url: config.url,
        headers: config.headers,
        data: config.data,
      });

      console.log('Resposta da requisição:', response.data);
      return response.data; // Retorna os dados da resposta
    } catch (error) {
      console.error('Erro ao processar o comando CURL:', error.message);
      throw error;
    }
  },
};

/**
 * Extrai as configurações (método, URL, headers e body) do código gerado pelo curlconverter.
 * @param {string} nodeCode - Código Node.js gerado pelo curlconverter.
 * @returns {object} - Configurações necessárias para o axios.
 */
function extrairConfiguracao(nodeCode) {
  try {
    // Função dinâmica para extrair os parâmetros do código convertido
    const func = new Function(`const axios = require('axios'); ${nodeCode}; return config;`);
    const config = func();

    return {
      method: config.method || 'get',
      url: config.url,
      headers: config.headers || {},
      data: config.data || null,
    };
  } catch (error) {
    console.error('Erro ao extrair configuração do código convertido:', error.message);
    throw error;
  }
}