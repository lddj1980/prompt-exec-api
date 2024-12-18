const TelegramService = require('../services/TelegramService'); // Ajuste o caminho para a classe TelegramService

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters ? modelParameters : {};
      console.log('Iniciando integração com o Telegram...');

      const botToken = modelParameters.botToken || null;
      const channelId = modelParameters.channelId || null;

      if (!botToken || !channelId) {
        throw new Error('Os parâmetros "botToken" e "channelId" são obrigatórios.');
      }

      // Instancia o serviço TelegramService
      const telegramService = new TelegramService(botToken, channelId);

      // Decide qual funcionalidade usar com base nos parâmetros
      if (modelParameters.action === 'sendMessage') {
        // Envia uma mensagem de texto
        console.log('Enviando mensagem de texto...');
        if (!modelParameters.message) {
          throw new Error('O parâmetro "message" é obrigatório para enviar uma mensagem de texto.');
        }

        const result = await telegramService.sendMessage(modelParameters.message);

        console.log('Mensagem enviada com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'sendPoll') {
        // Envia uma enquete
        console.log('Enviando enquete...');
        if (!modelParameters.question || !modelParameters.options) {
          throw new Error(
            'Os parâmetros "question" e "options" são obrigatórios para enviar uma enquete.'
          );
        }

        const result = await telegramService.sendPoll(
          modelParameters.question,
          modelParameters.options
        );

        console.log('Enquete enviada com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'sendPhoto') {
        // Envia uma imagem
        console.log('Enviando imagem...');
        if (!modelParameters.photoUrl) {
          throw new Error('O parâmetro "photoUrl" é obrigatório para enviar uma imagem.');
        }

        const result = await telegramService.sendPhoto(
          modelParameters.photoUrl,
          modelParameters.caption || ''
        );

        console.log('Imagem enviada com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'sendDocument') {
        // Envia um documento
        console.log('Enviando documento...');
        if (!modelParameters.documentPath) {
          throw new Error('O parâmetro "documentPath" é obrigatório para enviar um documento.');
        }

        const result = await telegramService.sendDocument(
          modelParameters.documentPath,
          modelParameters.caption || ''
        );

        console.log('Documento enviado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'sendVideo') {
        // Envia um vídeo
        console.log('Enviando vídeo...');
        if (!modelParameters.videoPath) {
          throw new Error('O parâmetro "videoPath" é obrigatório para enviar um vídeo.');
        }

        const result = await telegramService.sendVideo(
          modelParameters.videoPath,
          modelParameters.caption || ''
        );

        console.log('Vídeo enviado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'sendAudio') {
        // Envia um áudio
        console.log('Enviando áudio...');
        if (!modelParameters.audioPath) {
          throw new Error('O parâmetro "audioPath" é obrigatório para enviar um áudio.');
        }

        const result = await telegramService.sendAudio(
          modelParameters.audioPath,
          modelParameters.caption || ''
        );

        console.log('Áudio enviado com sucesso:', result);
        return result;

      } else {
        throw new Error(
          'Nenhuma ação válida foi especificada. Use "sendMessage", "sendPoll", "sendPhoto", "sendDocument", "sendVideo" ou "sendAudio" em "modelParameters.action".'
        );
      }
    } catch (error) {
      console.error('Erro durante a integração com o Telegram:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};