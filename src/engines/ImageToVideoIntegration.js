const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const ImageRepoAPI = require("../services/ImageRepoService");

module.exports = {
  async process(prompt, model, modelParameters = {}) {
    const { imagens, narracao, musica, tempo_por_imagem = 10, apiKey, responseKey } = modelParameters;

    try {
      console.log("Iniciando integração com o gerador de vídeo...");

      if (!imagens || !Array.isArray(imagens) || imagens.length === 0) {
        throw new Error("O parâmetro 'imagens' deve ser uma lista de URLs.");
      }

      if (!apiKey) {
        throw new Error("O parâmetro 'apiKey' é obrigatório para salvar no ImageRepo.");
      }

      if (!responseKey) {
        throw new Error("O parâmetro 'responseKey' é obrigatório.");
      }

      // Configurando o repositório de imagens
      const imageRepoAPI = new ImageRepoAPI();

      // Criando um arquivo temporário de texto para a lista de imagens
      const imageList = imagens.map((url, index) => `file '${url}'\nduration ${tempo_por_imagem}`).join("\n");
      const listFile = "/tmp/image_list.txt";

      // Salva o arquivo temporário contendo a lista de imagens
      const fs = require("fs");
      fs.writeFileSync(listFile, imageList);

      // Configurando o pipeline de vídeo no ffmpeg
      const ffmpegCommand = ffmpeg();

      ffmpegCommand.input(listFile).inputOptions(["-f concat", "-safe 0"]); // Lê a lista de imagens

      // Adiciona a narração, se disponível
      if (narracao) {
        const narracaoStream = await axios.get(narracao, { responseType: "stream" });
        ffmpegCommand.input(narracaoStream.data);
      }

      // Adiciona a música, se disponível
      if (musica) {
        const musicaStream = await axios.get(musica, { responseType: "stream" });
        ffmpegCommand.input(musicaStream.data);
      }

      // Criando stream de saída do vídeo
      const videoStream = ffmpegCommand
        .outputOptions("-movflags frag_keyframe+empty_moov") // Saída progressiva
        .videoCodec("libx264")
        .audioCodec("aac")
        .format("mp4")
        .pipe();

      console.log("Gerando vídeo...");

      // Salvando o vídeo no repositório de imagens
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
