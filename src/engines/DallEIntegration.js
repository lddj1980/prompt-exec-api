const axios = require('axios');
const ImageRepoAPI = require('../services/ImageRepoService'); // Ajuste o caminho para a classe ImageRepoAPI


module.exports = {
  async process(prompt, model,modelParameters) {
    try {
      
      modelParameters = modelParameters ? modelParameters : {};
      
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt: prompt,
          n: modelParameters.n ? modelParameters.n : 1,
          model: model ? model : 'dall-e-3',
          size: modelParameters.n ? modelParameters.size : '1024x1024',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DALLE_API_KEY}`,
          },
        }
      );

      
      if (response.status === 200 && response.data.data) {
         
          for (let index = 0; index < response.data.data.length; index++) {
              const imageUrl = response.data.data[index].url;

            // Salva a imagem no repositório
              console.log(`Enviando imagem ${index + 1} para o repositório de imagens...`);
              const savedImage = await imageRepoAPI.createImage(
                imageUrl, // url da imagem
                {}, // Metadados adicionais
                '.jpg', // Extensão do arquivo
                '73c6f20e-441e-4739-b42c-10c262138fdd', // Chave da API do Image Repo
                1, // Configuração do FTP
                false // Conteúdo em Base64
              );
              savedImages.push(savedImage);
          }

          console.log('Todas as imagens válidas foram salvas com sucesso!');
          return savedImages; // Retorna as imagens salvas
      } else {
        throw new Error(`Erro ao processar com DALL-E: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com DALL-E:', error);
      throw error;
    }
  },
};
