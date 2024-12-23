const TelegramService = require('../services/TelegramService'); // Ajuste o caminho para a classe TelegramService

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters ? modelParameters : {};
      console.log('Iniciando integração com o Telegram...');

      const botToken = modelParameters.bot_token || null;
      const channelId = modelParameters.channel_id || null;

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
        if (!modelParameters.photo_url) {
          throw new Error('O parâmetro "photoUrl" é obrigatório para enviar uma imagem.');
        }

        const result = await telegramService.sendPhoto(
          modelParameters.photo_url,
          modelParameters.caption || ''
        );

        console.log('Imagem enviada com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'sendDocument') {
        // Envia um documento
        console.log('Enviando documento...');
        if (!modelParameters.document_path) {
          throw new Error('O parâmetro "documentPath" é obrigatório para enviar um documento.');
        }

        const result = await telegramService.sendDocument(
          modelParameters.document_path,
          modelParameters.caption || ''
        );

        console.log('Documento enviado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'sendVideo') {
        // Envia um vídeo
        console.log('Enviando vídeo...');
        if (!modelParameters.video_path) {
          throw new Error('O parâmetro "videoPath" é obrigatório para enviar um vídeo.');
        }

        const result = await telegramService.sendVideo(
          modelParameters.video_path,
          modelParameters.caption || ''
        );

        console.log('Vídeo enviado com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'sendAudio') {
        // Envia um áudio
        console.log('Enviando áudio...');
        if (!modelParameters.audio_path) {
          throw new Error('O parâmetro "audioPath" é obrigatório para enviar um áudio.');
        }

        const result = await telegramService.sendAudio(
          modelParameters.audio_path,
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