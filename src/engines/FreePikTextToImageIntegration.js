const axios = require('axios');
const ImageRepoAPI = require('../services/ImageRepoService'); // Ajuste o caminho para a classe ImageRepoAPI
const sharp = require('sharp'); // Para processamento de imagem (se necessário)

// Criação do axiosInstance com configurações personalizadas
const axiosInstance = axios.create({
  maxBodyLength: Infinity, // Permite payloads grandes
  maxContentLength: Infinity, // Permite respostas grandes
  headers: {
    Authorization: `Bearer ${process.env.FREEPIK_API_KEY}`, // Token de API do Freepik
    'Content-Type': 'application/json',
  },
});

module.exports = {
  // Método principal para processar o prompt e gerar imagem
  async process(prompt, model, resolution = '1024x1024') {
    try {
      console.log('Iniciando a geração de imagem com o Freepik...');

      // Monta o payload da requisição
      const requestPayload = {
        prompt: prompt,
        model: model,
        resolution: resolution,
      };

      // Envia a requisição para a API do Freepik
      const endpoint = 'https://api.freepik.com/v1/ai/text-to-image';
      const response = await axiosInstance.post(endpoint, requestPayload, {
        responseType: 'arraybuffer', // Necessário para receber a imagem como binário
      });

      // Verifica o status da resposta
      if (response.status === 200) {
        console.log('Imagem gerada com sucesso!');

        // Converte o binário para Base64
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        console.log('Tamanho da imagem (Base64):', this.calculateBase64Size(base64Image));

        // Salva a imagem no repositório de imagens
        console.log('Enviando imagem para o repositório de imagens...');
        const imageRepoAPI = new ImageRepoAPI();
        const savedImage = await imageRepoAPI.createImage(
          base64Image, // Conteúdo em Base64
          {}, // Metadados da imagem
          '.jpg', // Extensão do arquivo
          '73c6f20e-441e-4739-b42c-10c262138fdd', // Chave da API do Image Repo
          1, // Configuração do FTP
          true // Define que o conteúdo está em Base64
        );

        console.log('Imagem salva com sucesso no repositório!');
        return savedImage; // Retorna a imagem salva
      } else {
        throw new Error(`Erro ao gerar imagem: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao integrar com a API Freepik:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },

  // Função auxiliar para calcular o tamanho do Base64 em bytes
  calculateBase64Size(base64String) {
    const base64 = base64String.split(',').pop(); // Remove cabeçalho, se houver
    const padding = (base64.match(/=/g) || []).length; // Conta caracteres '='
    return (base64.length * 3) / 4 - padding; // Calcula o tamanho em bytes
  },
};