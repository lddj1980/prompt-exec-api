const axios = require('axios');
const fs = require('fs');
const ImageRepoAPI = require('../services/ImageRepoService'); // Certifique-se de ajustar o caminho para o arquivo da classe ImageRepoAPI
const sharp = require('sharp');
module.exports = {
  async process(prompt, model,modelParameters=null) {
    try {
      // Monta o endpoint da Inference API com o modelo fornecido
      const endpoint = `https://api-inference.huggingface.co/models/${model}`;

      const apiKey = modelParameters ? (modelParameters.api_key ? modelParameters.api_key : process.env.HUGGINGFACE_API_KEY) : process.env.HUGGINGFACE_API_KEY; 
      // Faz a requisição para a Inference API
      const response = await axios.post(
        endpoint, 
        { inputs: prompt }, // Entrada esperada pela Inference API
        {
          headers: {
            Authorization: `Bearer ${apiKey}`, // Token de API do Hugging Face
            'Content-type': 'application/json',
            'x-wait-for-model': 'true'
          }
        }
      );

      // Verifica o status da resposta
      if (response.status === 200) {
        return response.data; // Processa a resposta da API
      } else {
        throw new Error(`Erro ao processar com Inference API: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com Inference API:', error);
      throw error;
    }
    
    
    
  }
};