const axios = require('axios');
const { Readable } = require('stream');

module.exports = {
  /**
   * Processa uma solicitação usando a API Gemini, incluindo suporte a texto e imagens.
   * @param {string} prompt - O texto a ser enviado para o modelo.
   * @param {string} model - O modelo a ser usado (por exemplo, "gemini-1.5-flash").
   * @param {object} modelParameters - Parâmetros adicionais para a solicitação, incluindo imagem.
   * @returns {Promise<object>} - A resposta processada pela API Gemini.
   * @throws {Error} - Caso ocorra um erro na chamada da API.
   */
  async process(prompt, model, modelParameters = {}) {
    try {
      modelParameters = modelParameters ? modelParameters : {};
      // Obter a chave da API
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('A variável de ambiente GEMINI_API_KEY não está definida.');
      }

      // Endpoint da API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      // Montar a estrutura de conteúdos
      const parts = [
        { text: prompt },
      ];

      // Se uma imagem for fornecida como URL, converte para Base64 e adiciona ao payload
      if (modelParameters.image_url) {
        const imageBase64 = await fetchImageAsBase64(modelParameters.image_url);
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg', // Ajuste o MIME type se necessário
            data: imageBase64,
          },
        });
      }

      // Corpo da solicitação
      const payload = {
        contents: [
          {
            parts: parts,
          },
        ],
      };

      console.log(`Enviando solicitação para ${endpoint}...`);

      // Chamada à API
      const response = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        return extrairJSON(response.data.candidates[0].content.parts[0].text);
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

/**
 * Faz o download de uma imagem de uma URL e converte para Base64.
 * @param {string} url - A URL da imagem.
 * @returns {Promise<string>} - Uma string em Base64.
 */
async function fetchImageAsBase64(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data).toString('base64');
  } catch (error) {
    console.error(`Erro ao buscar imagem da URL '${url}':`, error.message);
    throw error;
  }
}

/**
 * Extrai JSON da resposta do Gemini.
 * @param {string} resposta - A resposta retornada pelo modelo.
 * @returns {object|null} - O objeto JSON extraído, ou null em caso de erro.
 */
function extrairJSON(resposta) {
    // Exibir a resposta completa para debug
    console.log('resposta gerada...');
    console.log(resposta);

    // Definir o padrão regex para capturar o conteúdo entre ```json e ```
    const regex = /```json\s*([\s\S]*?)\s*```/;
    const match = resposta.match(regex);

    if (match && match[1]) {
        try {
            // Converte a string JSON capturada para um objeto JavaScript
            const jsonString = match[1].trim(); // Remove espaços em branco extras
            console.log('teste');
            console.log(jsonString);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Erro ao fazer o parse do JSON:', error);
            return null;
        }
    } else {
        try {
          return JSON.parse(resposta);
        } catch (error){
          return resposta;
        }
    }
}