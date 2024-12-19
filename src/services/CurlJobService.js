const axios = require('axios');

class CurlJobService {
  /**
   * Inicializa a integração com a API de agendamento de cURL.
   * @param {string} baseURL - A URL base da API de agendamentos.
   */
  constructor(baseURL = 'https://curl-executer.vercel.app') {
    this.baseURL = baseURL;
  }

  /**
   * Agendar um comando cURL com uma expressão cron.
   * @param {string} apiKey - API Key para autorização.
   * @param {object} payload - Dados do agendamento (curl_command, cron_expression, start_at, end_at).
   * @returns {Promise<object>} - Resposta da API contendo o protocolo do agendamento.
   * @throws {Error} - Caso ocorra algum erro na chamada ao serviço.
   */
  async scheduleCurlJob(apiKey, payload) {
    const url = `${this.baseURL}/schedule`;
    console.log(`Scheduling cURL job at: ${url}`);

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'x-api-key': apiKey,
        },
      });
      console.log('Job scheduled successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error scheduling job:', error.message);
      throw new Error(`Failed to schedule job: ${error.message}`);
    }
  }

  /**
   * Consultar o status e logs de um agendamento.
   * @param {string} apiKey - API Key para autorização.
   * @param {string} protocol - Protocolo do agendamento.
   * @returns {Promise<object>} - Logs do agendamento.
   * @throws {Error} - Caso ocorra algum erro na chamada ao serviço.
   */
  async getExecutionStatus(apiKey, protocol) {
    const url = `${this.baseURL}/status/${protocol}`;
    console.log(`Fetching execution status from: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'x-api-key': apiKey,
        },
      });
      console.log('Execution status retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching execution status:', error.message);
      throw new Error(`Failed to fetch execution status: ${error.message}`);
    }
  }

  /**
   * Recuperar os agendamentos filtrados por parâmetros opcionais.
   * @param {string} apiKey - API Key para autorização.
   * @param {object} filters - Filtros opcionais (protocol, created_at, cron_expression).
   * @returns {Promise<Array>} - Lista de agendamentos.
   * @throws {Error} - Caso ocorra algum erro na chamada ao serviço.
   */
  async getScheduledJobs(apiKey, filters = {}) {
    const url = `${this.baseURL}/schedules`;
    console.log(`Retrieving scheduled jobs from: ${url} with filters`, filters);

    try {
      const response = await axios.get(url, {
        headers: {
          'x-api-key': apiKey,
        },
        params: filters,
      });
      console.log('Scheduled jobs retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error retrieving scheduled jobs:', error.message);
      throw new Error(`Failed to retrieve scheduled jobs: ${error.message}`);
    }
  }

  /**
   * Deletar um agendamento existente.
   * @param {string} apiKey - API Key para autorização.
   * @param {string} protocol - Protocolo do agendamento a ser deletado.
   * @returns {Promise<object>} - Resposta da API.
   * @throws {Error} - Caso ocorra algum erro na chamada ao serviço.
   */
  async deleteSchedule(apiKey, protocol) {
    const url = `${this.baseURL}/schedules/${protocol}`;
    console.log(`Deleting scheduled job at: ${url}`);

    try {
      const response = await axios.delete(url, {
        headers: {
          'x-api-key': apiKey,
        },
      });
      console.log('Job deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting scheduled job:', error.message);
      throw new Error(`Failed to delete scheduled job: ${error.message}`);
    }
  }
}

module.exports = CurlJobService;