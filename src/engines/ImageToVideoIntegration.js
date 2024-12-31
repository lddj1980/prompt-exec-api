const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const ImageRepoAPI = require("../services/ImageRepoService");

module.exports = {
  async process(prompt, model, modelParameters = {}) {
    // Extraindo parâmetros obrigatórios
    const { imagens, narracao, musica, tempo_por_imagem = 10, apiKey, responseKey } = modelParameters;

    try {
      console.log("Iniciando integração com o gerador de vídeo...");

      if (!imagens || !Array.isArray(imagens) || imagens.length === 0) {
        throw new Error("O parâmetro 'imagens' deve ser uma lista de URLs ou streams.");
      }
      if (!narracao) {
        throw new Error("O parâmetro 'narracao' é obrigatório.");
      }
      if (!musica) {
        throw new Error("O parâmetro 'musica' é obrigatório.");
      }
      if (!apiKey) {
        throw new Error("O parâmetro 'apiKey' é obrigatório para salvar no ImageRepo.");
      }
      if (!responseKey) {
        throw new Error("O parâmetro 'responseKey' é obrigatório.");
      }

      // Configurando o repositório de imagens
      const imageRepoAPI = new ImageRepoAPI();

      // Criação do pipeline de vídeo com streams
      const ffmpegCommand = ffmpeg();

      // Adicionando imagens como entradas
      for (const imagemUrl of imagens) {
        const imagemStream = await axios.get(imagemUrl, { responseType: "stream" });
        ffmpegCommand.input(imagemStream.data).inputOptions([`-loop 1`, `-t ${tempo_por_imagem}`]);
      }

      // Adicionando narração e música como entradas
      const narracaoStream = await axios.get(narracao, { responseType: "stream" });
      const musicaStream = await axios.get(musica, { responseType: "stream" });

      ffmpegCommand.input(narracaoStream.data);
      ffmpegCommand.input(musicaStream.data);

      // Criando um stream de saída para o vídeo
      const videoStream = ffmpegCommand
        .outputOptions("-movflags frag_keyframe+empty_moov") // Opções para saída progressiva
        .videoCodec("libx264")
        .audioCodec("aac")
        .format("mp4")
        .pipe();

      console.log("Vídeo sendo gerado...");

      // Salvando o vídeo diretamente no ImageRepo
      const savedVideo = await imageRepoAPI.createImage(
        videoStream, // Conteúdo do vídeo como stream
        { description: "Vídeo gerado automaticamente", tags: ["video"] }, // Metadados
        ".mp4", // Extensão
        apiKey,
        1, // Configuração do FTP (exemplo)
        false // Não é conteúdo Base64
      );

      console.log("Vídeo salvo no repositório com sucesso:", savedVideo);

      // Retornando com responseKey
      return {
        [responseKey]: {
          success: true,
          video: savedVideo,
        },
      };
    } catch (error) {
      console.error("Erro durante a integração com o gerador de vídeo:", error.message);

      // Em caso de erro, retorna uma resposta vazia com a responseKey
      return {
        [responseKey]: {
          success: false,
          video: null,
          error: error.message,
        },
      };
    }
  },
};