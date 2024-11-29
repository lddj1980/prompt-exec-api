const pool = require('../config/database');

class PromptRepository {
  static async insertPrompt(solicitacaoId, conteudo, engine, modelo, ordem) {
    const [result] = await pool.query(
      'INSERT INTO prompts (solicitacao_id, conteudo, engine, modelo, ordem) VALUES (?, ?, ?, ?, ?)',
      [solicitacaoId, conteudo, engine, modelo, ordem]
    );
    return result.insertId;
  }

  static async getPromptsBySolicitacao(solicitacaoId) {
    const [rows] = await pool.query(
      'SELECT * FROM prompts WHERE solicitacao_id = ? ORDER BY ordem ASC',
      [solicitacaoId]
    );
    return rows;
  }
}

module.exports = PromptRepository;
