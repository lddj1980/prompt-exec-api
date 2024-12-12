const axios = require('axios');
const ImageRepoAPI = require('../services/ImageRepoService'); // Ajuste o caminho para o arquivo da classe ImageRepoAPI
const sharp = require('sharp');

// Criação do axiosInstance com configurações personalizadas
const axiosInstance = axios.create({
  maxBodyLength: Infinity, // Permite payloads grandes
  maxContentLength: Infinity, // Permite respostas grandes
  headers: {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, // Token de API do Hugging Face
    'Content-Type': 'application/json',
  },
});

module.exports = {
  async process(prompt, model, modelParameters = {}) {
    try {
      console.log('Aqui chegou');
      // Monta o endpoint da Inference API com o modelo fornecido
      const endpoint = `https://api-inference.huggingface.co/models/${model}`;

      // Faz a requisição para a Inference API usando axiosInstance
      const response = await axiosInstance.post(
        endpoint,
        {
          inputs: prompt, // Entrada esperada pela Inference API
          parameters: modelParameters, // Parâmetros adicionais, se fornecidos
        },
        {
          responseType: 'arraybuffer', // Necessário para lidar com binários como imagens
        }
      );

      // Verifica o status da resposta
      if (response.status === 200) {
        // Passo 2: Converter para Base64
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        console.log('Tamanho do arquivo: ' + calculateBase64Size(base64Image));

        // Instancia o repositório de imagens
        const imageRepoAPI = new ImageRepoAPI();

        // Salva a imagem no repositório de imagens
        console.log('Enviando imagem gerada para o Image Repo...');
        const savedImage = await imageRepoAPI.createImage(
          base64Image, // Conteúdo em Base64
          {}, // Metadados da imagem
          '.jpg', // Extensão do arquivo
          '73c6f20e-441e-4739-b42c-10c262138fdd', // Chave da API do Image Repo
          1, // Configuração do FTP
          true // Define que o conteúdo está em Base64
        );
        return savedImage; // Processa a resposta da API
      } else {
        throw new Error(`Erro ao processar com Inference API: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com Inference API:', error);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }

    // Função auxiliar para calcular o tamanho do Base64 em bytes
    function calculateBase64Size(base64String) {
      // Remove o prefixo "data:image/png;base64," ou outros cabeçalhos, se existirem
      const base64 = base64String.split(',').pop();

      // Conta os caracteres de preenchimento '='
      const padding = (base64.match(/=/g) || []).length;

      // Calcula o tamanho em bytes
      const sizeInBytes = (base64.length * 3) / 4 - padding;

      return sizeInBytes;
    }
  },
};