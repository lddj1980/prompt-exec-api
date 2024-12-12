const axios = require('axios');
const fs = require('fs');
const ImageRepoAPI = require('../services/ImageRepoService'); // Certifique-se de ajustar o caminho para o arquivo da classe ImageRepoAPI

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

        // Passo 1: Opcionalmente, comprimir/redimensionar a imagem
        const compressedBuffer = await sharp(response.data)
          .resize({ width: 1024 }) // Ajusta a largura para 1024px
          .jpeg({ quality: 80 }) // Converte para JPEG com qualidade de 80%
          .toBuffer();

        console.log('Imagem comprimida com sucesso.');

        // Passo 2: Converter para Base64
        const base64Image = compressedBuffer.toString('base64');
        
        // Instancia o repositório de imagens
        const imageRepoAPI = new ImageRepoAPI();

        // Salva a imagem no repositório de imagens
        console.log('Enviando imagem gerada para o Image Repo...');
        const savedImage = await imageRepoAPI.createImage(
          base64Image,        // Conteúdo em Base64
          {},           // Metadados da imagem
          '.jpg',          // Extensão do arquivo
          '73c6f20e-441e-4739-b42c-10c262138fdd',             // Chave da API do Image Repo
          1,        // Configuração do FTP
          true                // Define que o conteúdo está em Base64
        );
        return savedImage; // Processa a resposta da API
      } else {
        throw new Error(`Erro ao processar com Inference API: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com Inference API:', error);
      throw error;
    }
  }
};