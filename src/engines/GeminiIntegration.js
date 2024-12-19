const { generateText } = require('@google/generative-ai');

module.exports = {
  /**
   * Processa uma solicitação usando a API Gemini.
   * @param {string} prompt - O prompt a ser enviado para o modelo.
   * @param {string} model - O modelo a ser usado (por exemplo, "models/chat-bison-001").
   * @param {object} modelParameters - Parâmetros adicionais para a solicitação.
   * @returns {Promise<object>} - A resposta processada pela API Gemini.
   * @throws {Error} - Caso ocorra um erro na chamada da API.
   */
  async process(prompt, model, modelParameters = {}) {
    try {
      // Configurar a chave da API
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('A variável de ambiente GEMINI_API_KEY não está definida.');
      }

      // Configurar o cliente da API
      const client = new generateText({
        apiKey: apiKey,
      });

      // Chamar a API para gerar conteúdo
      const response = await client.generateText({
        model: model,
        prompt: prompt,
        ...modelParameters,
      });

      // Verificar se a resposta foi bem-sucedida
      if (response && response.candidates && response.candidates.length > 0) {
        return extrairJSON(response.candidates[0].output);
      } else {
        throw new Error('Erro ao processar com Gemini: resposta vazia');
      }
    } catch (error) {
      console.error('Erro na integração com Gemini:', error);
      throw error;
    }
  },
};

/**
 * Extrai o JSON da resposta retornada pela API.
 * @param {string} resposta - A resposta retornada pelo modelo.
 * @returns {object|null} - O objeto JSON extraído, ou null em caso de erro.
 */
function extrairJSON(resposta) {
  // Exibir a resposta completa para debug
  console.log('Resposta gerada pela Gemini...');
  console.log(resposta);

  // Definir o padrão regex para capturar o conteúdo entre ```json e ```
  const regex = /```json\s*([\s\S]*?)\s*```/;
  const match = resposta.match(regex);

  if (match && match[1]) {
    try {
      // Converte a string JSON capturada para um objeto JavaScript
      const jsonString = match[1].trim(); // Remove espaços em branco extras
      console.log('Conteúdo JSON extraído...');
      console.log(jsonString);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Erro ao fazer o parse do JSON:', error);
      return null;
    }
  } else {
    try {
      return JSON.parse(resposta);
    } catch (error) {
      console.error('Erro ao fazer o parse do JSON direto:', error);
      return null;
    }
  }
}
