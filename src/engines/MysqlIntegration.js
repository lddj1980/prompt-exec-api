const mysql = require('mysql2/promise');

module.exports = {
  /**
   * Processa uma requisição para um banco de dados MySQL.
   * @param {string} prompt - Informação principal da consulta (opcional).
   * @param {string} model - Nome do modelo ou banco de dados a ser utilizado.
   * @param {Object} modelParameters - Parâmetros para configurar a conexão e consulta.
   * @returns {Promise<Object>} - Resultado da consulta no formato JSON.
   */
  async process(prompt, model, modelParameters = {}) {
    const {
      host,
      user,
      password,
      database,
      port = 3306,
      query,
      values = [],
      responseKey = 'mysqlResponse',
    } = modelParameters;

    try {
      console.log('Iniciando integração com o banco de dados MySQL...');

      // Valida os parâmetros obrigatórios
      if (!host || !user || !password || !database || !query) {
        throw new Error('Os parâmetros "host", "user", "password", "database" e "query" são obrigatórios.');
      }

      // Cria a conexão com o banco de dados
      const connection = await mysql.createConnection({
        host,
        user,
        password,
        database,
        port,
      });

      console.log('Conexão estabelecida com sucesso.');

      // Executa a consulta
      const [rows] = await connection.execute(query, values);

      console.log('Consulta executada com sucesso:', rows);

      // Fecha a conexão
      await connection.end();

      // Retorna o resultado da consulta
      return {
        [responseKey]: {
          success: true,
          data: rows,
        },
      };
    } catch (error) {
      console.error('Erro durante a integração com o banco de dados MySQL:', error.message);

      // Em caso de erro, retorna um JSON vazio referenciado pela chave responseKey
      return {
        [responseKey]: {
          success: false,
          error: error.message,
        },
      };
    }
  },
};
