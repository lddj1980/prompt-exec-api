const { v4: uuidv4 } = require('uuid');
const SolicitacaoRepository = require('../data/SolicitacaoRepository');
const PromptRepository = require('../data/PromptRepository');
const ParametroRepository = require('../data/ParametroRepository');
const ProcessingService = require('../services/ProcessingService');

module.exports = {
  async create(req, res) {
    try {
      const { prompts } = req.body;

      if (!prompts || !Array.isArray(prompts)) {
        return res.status(400).json({ error: 'Prompts inválidos.' });
      }

      const protocoloUid = uuidv4();
      const solicitacaoId = await SolicitacaoRepository.createSolicitacao(protocoloUid);

      for (const [index, prompt] of prompts.entries()) {
        const promptId = await PromptRepository.insertPrompt(
          solicitacaoId,
          prompt.conteudo,
          prompt.engine,
          prompt.modelo,
          index + 1
        );

        if (prompt.parametros && Array.isArray(prompt.parametros)) {
          for (const parametro of prompt.parametros) {
            await ParametroRepository.insertParametro(promptId, parametro.nome, parametro.valor);
          }
        }
      }

      res.status(202).json({ protocoloUid });
      ProcessingService.process(protocoloUid);
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  async getProgress(req, res) {
    try {
      const { protocoloUid } = req.params;

      const solicitacao = await SolicitacaoRepository.getSolicitacaoByProtocolo(protocoloUid);
      if (!solicitacao) {
        return res.status(404).json({ error: 'Solicitação não encontrada.' });
      }

      const prompts = await PromptRepository.getPromptsBySolicitacao(solicitacao.id);

      res.status(200).json({
        status: solicitacao.status,
        prompts,
      });
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  async getResultado(req, res) {
    try {
      const { protocoloUid } = req.params;

      const solicitacao = await SolicitacaoRepository.getSolicitacaoByProtocolo(protocoloUid);
      if (!solicitacao) {
        return res.status(404).json({ error: 'Solicitação não encontrada.' });
      }

      res.status(200).json(solicitacao.resultado_dados || '{}');
    } catch (error) {
      console.error('Erro ao buscar resultado:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  async resume(req, res) {
    try {
      const { protocoloUid } = req.params;

      const solicitacao = await SolicitacaoRepository.getSolicitacaoByProtocolo(protocoloUid);
      if (!solicitacao) {
        return res.status(404).json({ error: 'Solicitação não encontrada.' });
      }

      if (solicitacao.status === 'concluido') {
        return res.status(400).json({ error: 'Solicitação já foi concluída.' });
      }

      await ProcessingService.resume(protocoloUid);

      res.status(202).json({ message: 'Processamento retomado.' });
    } catch (error) {
      console.error('Erro ao retomar solicitação:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },
};
