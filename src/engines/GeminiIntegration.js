const axios = require('axios');

module.exports = {
  /**
   * Processa uma solicitação usando a API Gemini na Vertex AI.
   * @param {string} prompt - O prompt a ser enviado para o modelo.
   * @param {string} model - O modelo a ser usado (por exemplo, "gemini-1.5-pro").
   * @param {object} modelParameters - Parâmetros adicionais para a solicitação.
   * @returns {Promise<object>} - A resposta processada pela API Gemini.
   * @throws {Error} - Caso ocorra um erro na chamada da API.
   */
  async process(prompt, model, modelParameters = {}) {
    try {
      // Configurações
      const projectId = process.env.GCP_PROJECT_ID; // ID do projeto Google Cloud
      const region = process.env.GCP_REGION || 'us-central1'; // Região da Vertex AI
      const accessToken = process.env.GCP_ACCESS_TOKEN; // Token de acesso

      if (!projectId || !accessToken) {
        throw new Error(
          'Os parâmetros "GCP_PROJECT_ID" e "GCP_ACCESS_TOKEN" são obrigatórios.'
        );
      }

      // Endpoint da API Gemini
      const endpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${model}:predict`;

      // Corpo da solicitação
      const payload = {
        instances: [
          {
            content: prompt,
            parameters: modelParameters,
          },
        ],
      };

      console.log(`Enviando solicitação para ${endpoint}...`);

      // Chamada à API
      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        return extrairJSON(response.data.predictions[0].content.trim());
      } else {
        throw new Error(`Erro ao processar com Gemini: ${response.statusText}`);
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
    return JSON.parse(resposta);
  }
}
