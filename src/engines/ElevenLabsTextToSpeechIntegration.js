const axios = require('axios');
const ImageRepoAPI = require('../services/ImageRepoService'); // Ajuste o caminho para o arquivo da classe ImageRepoAPI

module.exports = {
  async process(prompt, model, modelParameters = {}) {
    try {
      console.log('Iniciando integração com a API ElevenLabs');

      modelParameters = modelParameters ? modelParameters : {};
      
      if (!modelParameters.voice_id) {
        throw new Error('O parâmetro "voice_id" é obrigatório.');
      }
      
      // Configuração do endpoint e headers
      const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${modelParameters.voice_id}`;
      const headers = {
        'xi-api-key': process.env.ELEVENLABS_API_KEY, // Substitua pela sua chave de API
        'Content-Type': 'application/json',
      };

      // Corpo da requisição
      const requestBody = { prompt };

      // Faz a requisição POST usando axios
      const response = await axios.post(endpoint, requestBody, {
        headers,
        responseType: 'arraybuffer', // Para receber os dados binários do áudio
      });

      if (response.status === 200) {
        // Converte a resposta binária para Base64
        const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
        console.log('Tamanho do arquivo em Base64:', calculateBase64Size(base64Audio));

        // Instancia o repositório de imagens (ou similar para áudio)
        const imageRepoAPI = new ImageRepoAPI();

        // Salva o áudio convertido em Base64 no repositório
        console.log('Enviando áudio gerado para o repositório...');
        const savedAudio = await imageRepoAPI.createImage(
          base64Audio, // Conteúdo em Base64
          {}, // Metadados do áudio
          '.mp3', // Extensão do arquivo
          '73c6f20e-441e-4739-b42c-10c262138fdd', // Chave da API do Image Repo
          1, // Configuração de FTP (se necessário)
          true // Define que o conteúdo está em Base64
        );

        return savedAudio; // Retorna os detalhes do áudio salvo
      } else {
        throw new Error(`Erro na API ElevenLabs: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com a API ElevenLabs:', error);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }

    // Função auxiliar para calcular o tamanho do Base64 em bytes
    function calculateBase64Size(base64String) {
      const base64 = base64String.split(',').pop(); // Remove prefixos, se existirem
      const padding = (base64.match(/=/g) || []).length; // Conta '='
      return (base64.length * 3) / 4 - padding; // Calcula tamanho em bytes
    }
  },
};