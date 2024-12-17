const axios = require('axios');
const ImageRepoAPI = require('../services/ImageRepoService'); // Ajuste o caminho para a classe ImageRepoAPI

// Criação do axiosInstance com configurações personalizadas
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'x-freepik-api-key': process.env.FREEPIK_API_KEY, // Token de API do Freepik
  },
});

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters ? modelParameters : {};
      console.log('Iniciando geração de imagem com o Freepik...');

      // Monta o payload da requisição
      const payload = {
        prompt: prompt,
        negative_prompt: modelParameters.negativePrompt ? modelParameters.negativePrompt : {},
        guidance_scale: modelParameters.guidanceScale ? modelParameters.guidanceScale : 1,
        seed: modelParameters.seed ? modelParameters.seed : 0,
        num_images: modelParameters.numImages ? modelParameters.numImages : 1,
        image: modelParameters.image ? modelParameters.image : {
          size: 'square_1_1', // Tamanho padrão conforme o exemplo
        },
        styling: modelParameters.styling ? modelParameters.styling : {},
      };

      // Endpoint da API do Freepik
      const endpoint = 'https://api.freepik.com/v1/ai/text-to-image';

      // Faz a requisição para a API
      const response = await axiosInstance.post(endpoint, payload);

      console.log(response.data);
      if (response.status === 200 && response.data.data) {
        console.log('Imagens geradas com sucesso!');

        // Itera sobre as imagens retornadas
        const imageRepoAPI = new ImageRepoAPI();
        const savedImages = [];

        for (let index = 0; index < response.data.data.length; index++) {
            const image = response.data.data[index];

            // Valida se a imagem não possui conteúdo NSFW
            if (image.has_nsfw) {
              console.warn(`Imagem ${index + 1} foi identificada como NSFW e será ignorada.`);
              continue;
            }

            // Converte a imagem Base64 para o formato esperado pelo repositório
            const base64Image = image.base64;
            console.log(`Imagem ${index + 1} processada (tamanho Base64: ${this.calculateBase64Size(base64Image)} bytes)`);

          // Salva a imagem no repositório
            console.log(`Enviando imagem ${index + 1} para o repositório de imagens...`);
            const savedImage = await imageRepoAPI.createImage(
              base64Image, // Conteúdo em Base64
              {}, // Metadados adicionais
              '.jpg', // Extensão do arquivo
              '73c6f20e-441e-4739-b42c-10c262138fdd', // Chave da API do Image Repo
              1, // Configuração do FTP
              true // Conteúdo em Base64
            );

            savedImages.push(savedImage);
        }

        console.log('Todas as imagens válidas foram salvas com sucesso!');
        return savedImages; // Retorna as imagens salvas
      } else {
         throw new Error('Resposta inválida ou mal formatada da API Freepik.');
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
    const padding = (base64.match(/=/g) || []).length;
    return (base64.length * 3) / 4 - padding;
  },
};
