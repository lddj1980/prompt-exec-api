const axios = require('axios');
const WhatsappService = require('../services/WhatsappService'); // Ajuste o caminho para a classe WhatsappService

module.exports = {
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters ? modelParameters : {};
      console.log('Iniciando integração com o WhatsApp Proxy API...');

      const apiKey = modelParameters.apiKey || null;

      if (!apiKey) {
        throw new Error('O parâmetro "apiKey" é obrigatório.');
      }

      // Instancia o serviço WhatsappService
      const whatsappService = new WhatsappService(modelParameters.baseURL);

      // Decide qual funcionalidade usar com base nos parâmetros
      if (modelParameters.action === 'sendMessage') {
        // Envia uma mensagem de texto
        console.log('Enviando mensagem de texto...');
        if (!modelParameters.number || !modelParameters.message) {
          throw new Error(
            'Os parâmetros "number" e "message" são obrigatórios para enviar uma mensagem de texto.'
          );
        }

        const result = await whatsappService.sendMessage(
          modelParameters.number,
          modelParameters.message,
          apiKey
        );

        console.log('Mensagem enviada com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'sendMedia') {
        // Envia uma mensagem com mídia
        console.log('Enviando mensagem com mídia...');
        if (
          !modelParameters.number ||
          !modelParameters.mediaUrl ||
          !modelParameters.mimeType ||
          !modelParameters.fileName
        ) {
          throw new Error(
            'Os parâmetros "number", "mediaUrl", "mimeType" e "fileName" são obrigatórios para enviar uma mensagem com mídia.'
          );
        }

        const result = await whatsappService.sendMedia(
          modelParameters.number,
          modelParameters.mediaUrl,
          modelParameters.mimeType,
          modelParameters.fileName,
          modelParameters.caption || '',
          apiKey
        );

        console.log('Mensagem com mídia enviada com sucesso:', result);
        return result;

      } else if (modelParameters.action === 'sendGroupMessage') {
        // Envia uma mensagem para um grupo
        console.log('Enviando mensagem para um grupo...');
        if (!modelParameters.groupId || !modelParameters.message) {
          throw new Error(
            'Os parâmetros "groupId" e "message" são obrigatórios para enviar uma mensagem para um grupo.'
          );
        }

        const result = await whatsappService.sendGroupMessage(
          modelParameters.groupId,
          modelParameters.message,
          apiKey
        );

        console.log('Mensagem para o grupo enviada com sucesso:', result);
        return result;

      } else {
        throw new Error(
          'Nenhuma ação válida foi especificada. Use "sendMessage", "sendMedia" ou "sendGroupMessage" em "modelParameters.action".'
        );
      }
    } catch (error) {
      console.error('Erro durante a integração com o WhatsApp Proxy API:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};