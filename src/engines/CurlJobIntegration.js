const CurlJobService = require('../services/CurlJobService'); // Ajuste o caminho para a classe CurlJobService

module.exports = {
  /**
   * Processa uma ação com base nos parâmetros fornecidos.
   * @param {string} prompt - Contexto ou descrição da tarefa (não usado diretamente neste caso).
   * @param {string} model - Modelo ou contexto da ação (não usado diretamente neste caso).
   * @param {object} modelParameters - Parâmetros para execução da ação.
   * @returns {Promise<object>} - Resultado da ação executada.
   * @throws {Error} - Caso ocorra algum erro durante o processamento.
   */
  async process(prompt, model, modelParameters) {
    try {
      modelParameters = modelParameters ? modelParameters : {};
      console.log('Iniciando integração com o serviço de agendamento de cURL...');

      const apiKey = modelParameters.apiKey || null;

      if (!apiKey) {
        throw new Error('O parâmetro "apiKey" é obrigatório.');
      }

      // Instancia o serviço CurlJobService
      const curlJobService = new CurlJobService();

      // Decide qual funcionalidade usar com base nos parâmetros
      if (modelParameters.action === 'scheduleCurlJob') {
        // Agendar um novo job
        console.log('Agendando um novo job...');
        const { cron_expression, start_at, end_at } = modelParameters;

        if (!prompt || !cron_expression) {
          throw new Error(
            'Os parâmetros "curl_command" e "cron_expression" são obrigatórios para agendar um job.'
          );
        }

        console.log(prompt);
        
        const scheduledJob = await curlJobService.scheduleCurlJob(apiKey, {
          curl_command:prompt,
          cron_expression,
          start_at,
          end_at,
        });

        console.log('Job agendado com sucesso:', scheduledJob);
        return scheduledJob;

      } else if (modelParameters.action === 'getExecutionStatus') {
        // Consultar status e logs de um job
        console.log('Consultando status de execução...');
        const protocol = modelParameters.protocol || null;

        if (!protocol) {
          throw new Error('O parâmetro "protocol" é obrigatório para consultar o status.');
        }

        const executionStatus = await curlJobService.getExecutionStatus(apiKey, protocol);

        console.log('Status de execução obtido com sucesso:', executionStatus);
        return executionStatus;

      } else if (modelParameters.action === 'getScheduledJobs') {
        // Recuperar agendamentos
        console.log('Recuperando agendamentos...');
        const { protocol, created_at, cron_expression } = modelParameters;

        const scheduledJobs = await curlJobService.getScheduledJobs(apiKey, {
          protocol,
          created_at,
          cron_expression,
        });

        console.log('Agendamentos recuperados com sucesso:', scheduledJobs);
        return scheduledJobs;

      } else if (modelParameters.action === 'deleteSchedule') {
        // Deletar um job agendado
        console.log('Deletando um job agendado...');
        const protocol = modelParameters.protocol || null;

        if (!protocol) {
          throw new Error('O parâmetro "protocol" é obrigatório para deletar um job.');
        }

        const deletedJob = await curlJobService.deleteSchedule(apiKey, protocol);

        console.log('Job deletado com sucesso:', deletedJob);
        return deletedJob;

      } else {
        throw new Error(
          'Nenhuma ação válida foi especificada. Use "scheduleCurlJob", "getExecutionStatus", "getScheduledJobs" ou "deleteSchedule" em "modelParameters.action".'
        );
      }

    } catch (error) {
      console.error('Erro durante a integração com o serviço de agendamento de cURL:', error.message);

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }

      throw error;
    }
  },
};
