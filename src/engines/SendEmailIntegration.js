const axios = require('axios');

module.exports = {
  async process(prompt, model, modelParameters = {}) {
    try {
      console.log('Iniciando integração com o serviço de e-mail externo...');

      // Verifica e extrai os parâmetros necessários de modelParameters
      const { from, to, subject, body } = modelParameters;

      if (!from || !to || !subject || !body) {
        throw new Error('Os parâmetros "from", "to", "subject" e "body" são obrigatórios.');
      }

      // Configuração do endpoint e headers do serviço externo
      const endpoint = 'https://emailprovider.vercel.app/api/send-email'; // Substitua pela URL do serviço externo
      const headers = {
        'Content-Type': 'application/json',
      };

      // Corpo da requisição
      const requestBody = { from, to, subject, body };

      // Faz a requisição POST para o serviço externo
      const response = await axios.post(endpoint, requestBody, { headers });

      if (response.status === 200 && response.data.success) {
        console.log('E-mail enviado com sucesso:', response.data);

        return {
          success: true,
          provider: response.data.provider || 'Desconhecido',
        };
      } else {
        console.error('Falha no envio de e-mail:', response.data);
        throw new Error('Falha ao enviar o e-mail.');
      }
    } catch (error) {
      console.error('Erro ao integrar com o serviço de e-mail:', error);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};