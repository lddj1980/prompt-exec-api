const pool = require('../config/database');

class PromptRepository {
  /**
   * Insere um novo prompt no banco de dados.
   * @param {number} solicitacaoId - ID da solicitação associada.
   * @param {string} prompt - Conteúdo do prompt.
   * @param {string} engine - Engine associada ao prompt.
   * @param {string} modelo - Modelo associado ao prompt.
   * @param {number} ordem - Ordem do prompt.
   * @param {object|null} parametrosModelo - Parâmetros do modelo em formato JSON (opcional).
   * @returns {number} - ID do prompt inserido.
   */
  static async insertPrompt(solicitacaoId, prompt, engine, model, ordem, model_parameters, cron_expression,start_at,end_at) {
    // Definir a consulta SQL dependendo da presença de `parametrosModelo`
    const sql = model_parameters
      ? 'INSERT INTO prompts (solicitacao_id, prompt, engine, modelo, ordem, parametros_modelo) VALUES (?, ?, ?, ?, ?, ?)'
      : 'INSERT INTO prompts (solicitacao_id, prompt, engine, modelo, ordem) VALUES (?, ?, ?, ?, ?)';

    // Definir os valores a serem usados na consulta
    const values = model_parameters
      ? [solicitacaoId, prompt, engine, model, ordem, JSON.stringify(model_parameters)]
      : [solicitacaoId, prompt, engine, model, ordem];

    // Executar a consulta
    const [result] = await pool.query(sql, values);
    return result.insertId;
  }

  /**
   * Obtém os prompts associados a uma solicitação.
   * @param {number} solicitacaoId - ID da solicitação.
   * @returns {Array<object>} - Lista de prompts associados.
   */
  static async getPromptsBySolicitacao(solicitacaoId) {
    const [rows] = await pool.query(
      'SELECT * FROM prompts WHERE solicitacao_id = ? ORDER BY ordem ASC',
      [solicitacaoId]
    );
    return rows;
  }
}

module.exports = PromptRepository;
