const axios = require('axios');
const fs = require('fs');

module.exports = {
  async process(prompt, model) {
    try {
      console.log('aqui chegou');
      // Monta o endpoint da Inference API com o modelo fornecido
      const endpoint = `https://api-inference.huggingface.co/models/${model}`;

      // Faz a requisição para a Inference API
      const response = await axios.post(
        endpoint, 
        { inputs: prompt }, // Entrada esperada pela Inference API
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, // Token de API do Hugging Face
            'Content-type': 'application/json'
          }
        }
      );

      // Verifica o status da resposta
      if (response.status === 200) {

        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        return {"imageBase64":base64Image}; // Processa a resposta da API
      } else {
        throw new Error(`Erro ao processar com Inference API: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com Inference API:', error);
      throw error;
    }
  }
};