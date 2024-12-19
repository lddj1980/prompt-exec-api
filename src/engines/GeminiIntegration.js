const axios = require('axios');

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
      modelParameters = modelParameters ? modelParameters : {};
      const apiKey = process.env.GEMINI_API_KEY;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta2/${model}:generateMessage`;

      if (!apiKey) {
        throw new Error('A variável de ambiente GEMINI_API_KEY não está definida.');
      }

      // Corpo da solicitação
      const payload = {
        prompt: {
          messages: [
            { author: "user", content: prompt }
          ]
        },
        temperature: modelParameters.temperature || 0.7,
        candidate_count: modelParameters.candidate_count || 1,
        max_output_tokens: modelParameters.max_tokens || 256,
      };

      console.log(`Enviando solicitação para ${endpoint}...`);

      // Chamada à API
      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        return response.data.candidates[0]?.content || "Nenhuma resposta obtida.";
      } else {
        throw new Error(`Erro ao processar com Gemini: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com Gemini:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
      throw error;
    }
  },
};