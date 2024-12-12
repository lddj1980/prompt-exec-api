const axios = require('axios');
const fs = require('fs');
const ImageRepoAPI = require('../services/ImageRepoService'); // Certifique-se de ajustar o caminho para o arquivo da classe ImageRepoAPI
const sharp = require('sharp');
module.exports = {
  async process(prompt, model,modelParameters={}) {
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
          },
          responseType:'arraybuffer'
        }
      );

      // Verifica o status da resposta
      if (response.status === 200) {

        // Passo 2: Converter para Base64
        const base64Image = Buffer.from(response.data,'binary').toString('base64');
        console.log('tamanho do arquivo:'+calculateBase64Size(base64Image));
        
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
    
    
    function calculateBase64Size(base64String) {
      // Remove o prefixo "data:image/png;base64," ou outros cabeçalhos, se existirem
      const base64 = base64String.split(',').pop();

      // Conta os caracteres de preenchimento '='
      const padding = (base64.match(/=/g) || []).length;

      // Calcula o tamanho em bytes
      const sizeInBytes = (base64.length * 3) / 4 - padding;

      return sizeInBytes;
    }
  }
};