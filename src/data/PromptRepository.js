const pool = require('../config/database');

class PromptRepository {
  /**
   * Insere um novo prompt no banco de dados.
   * @param {number} solicitacaoId - ID da solicitação associada.
   * @param {string} conteudo - Conteúdo do prompt.
   * @param {string} engine - Engine associada ao prompt.
   * @param {string} modelo - Modelo associado ao prompt.
   * @param {number} ordem - Ordem do prompt.
   * @param {object|null} parametrosModelo - Parâmetros do modelo em formato JSON (opcional).
   * @returns {number} - ID do prompt inserido.
   */
  static async insertPrompt(solicitacaoId, conteudo, engine, modelo, ordem, parametrosModelo = null) {
    // Definir a consulta SQL dependendo da presença de `parametrosModelo`
    const sql = parametrosModelo
      ? 'INSERT INTO prompts (solicitacao_id, conteudo, engine, modelo, ordem, parametros_modelo) VALUES (?, ?, ?, ?, ?, ?)'
      : 'INSERT INTO prompts (solicitacao_id, conteudo, engine, modelo, ordem) VALUES (?, ?, ?, ?, ?)';

    // Definir os valores a serem usados na consulta
    const values = parametrosModelo
      ? [solicitacaoId, conteudo, engine, modelo, ordem, JSON.stringify(parametrosModelo)]
      : [solicitacaoId, conteudo, engine, modelo, ordem];

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
