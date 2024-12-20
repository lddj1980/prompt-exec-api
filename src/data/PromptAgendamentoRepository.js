const pool = require('../config/database');

class PromptAgendamentoRepository {
  /**
   * Insere um novo agendamento no banco de dados.
   * @param {number} promptId - ID do prompt associado.
   * @param {string} cronExpression - Expressão cron do agendamento.
   * @param {Date|null} dataInicioValidade - Data de início da validade (opcional).
   * @param {Date|null} dataFimValidade - Data de fim da validade (opcional).
   * @returns {number} - ID do agendamento inserido.
   */
  static async insertAgendamento(promptId, cronExpression, dataInicioValidade = null, dataFimValidade = null) {
    const sql = `
      INSERT INTO prompt_agendamentos (prompt_id, cron_expression, data_inicio_validade, data_fim_validade)
      VALUES (?, ?, ?, ?)
    `;
    const values = [promptId, cronExpression, dataInicioValidade, dataFimValidade];
    const [result] = await pool.query(sql, values);
    return result.insertId;
  }

  /**
   * Obtém os agendamentos associados a um prompt.
   * @param {number} promptId - ID do prompt.
   * @returns {Array<object>} - Lista de agendamentos associados.
   */
  static async getAgendamentosByPrompt(promptId) {
    const sql = `
      SELECT * FROM prompt_agendamentos
      WHERE prompt_id = ?
      ORDER BY data_criacao ASC
    `;
    const [rows] = await pool.query(sql, [promptId]);
    return rows;
  }

  /**
   * Atualiza um agendamento existente.
   * @param {number} id - ID do agendamento.
   * @param {string} cronExpression - Nova expressão cron.
   * @param {Date|null} dataInicioValidade - Nova data de início da validade (opcional).
   * @param {Date|null} dataFimValidade - Nova data de fim da validade (opcional).
   * @returns {boolean} - Indica se a atualização foi bem-sucedida.
   */
  static async updateAgendamento(id, cronExpression, dataInicioValidade = null, dataFimValidade = null) {
    const sql = `
      UPDATE prompt_agendamentos
      SET cron_expression = ?, data_inicio_validade = ?, data_fim_validade = ?
      WHERE id = ?
    `;
    const values = [cronExpression, dataInicioValidade, dataFimValidade, id];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  }

  /**
   * Remove um agendamento do banco de dados.
   * @param {number} id - ID do agendamento.
   * @returns {boolean} - Indica se a remoção foi bem-sucedida.
   */
  static async deleteAgendamento(id) {
    const sql = `
      DELETE FROM prompt_agendamentos
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = PromptAgendamentoRepository;
