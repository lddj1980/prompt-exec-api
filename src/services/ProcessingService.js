const SolicitacaoRepository = require('../data/SolicitacaoRepository');
const PromptRepository = require('../data/PromptRepository');
const ParametroRepository = require('../data/ParametroRepository');
const PromptResultadoRepository = require('../data/PromptResultadoRepository');
const LLMIntegration = require('./LLMIntegration');

module.exports = {
  async process(protocoloUid) {
    try {
      const solicitacao = await SolicitacaoRepository.getSolicitacaoByProtocolo(protocoloUid);
      if (!solicitacao) throw new Error('Solicitação não encontrada.');

      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'em_progresso');

      const prompts = await PromptRepository.getPromptsBySolicitacao(solicitacao.id);
      const resultadoGlobal = {};

      for (const prompt of prompts) {
        const parametros = await ParametroRepository.getParametrosByPrompt(prompt.id);
        const substituicoes = this.prepareSubstituicoes(parametros, resultadoGlobal);
        const promptConteudo = this.replacePlaceholders(prompt.conteudo, substituicoes);

        console.log('segue prompt:');
        console.log(promptConteudo);

        const resultado = await LLMIntegration.processPrompt(promptConteudo, prompt.engine, prompt.modelo);

        // Processar o resultado para adicionar ao resultadoGlobal
        for (const [key, value] of Object.entries(resultado)) {
          if (Array.isArray(value)) {
            // Se o valor é um array, incluir cada elemento no formato "key.index"
            value.forEach((item, index) => {
              resultadoGlobal[`${key}.${index}`] = item;
            });
          } else {
            // Caso contrário, adicionar diretamente
            resultadoGlobal[key] = value;
          }
        }

        
        await PromptResultadoRepository.insertPromptResultado(solicitacao.id, prompt.id, JSON.stringify(resultado));
      }

      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'concluido', JSON.stringify(resultadoGlobal));
    } catch (error) {
      console.error('Erro no processamento:', error);
      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'erro');
    }
  },

  async resume(protocoloUid) {
    try {
      const solicitacao = await SolicitacaoRepository.getSolicitacaoByProtocolo(protocoloUid);
      if (!solicitacao) throw new Error('Solicitação não encontrada.');

      if (solicitacao.status === 'concluido') {
        console.log('Solicitação já concluída.');
        return;
      }

      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'em_progresso');

      const prompts = await PromptRepository.getPromptsBySolicitacao(solicitacao.id);
      const ultimoPromptResultado = await PromptResultadoRepository.getUltimoPromptResultado(solicitacao.id);
      const ordemInicio = ultimoPromptResultado ? ultimoPromptResultado.ordem + 1 : 1;

      const resultadoGlobal = this.loadResultadosGlobais(solicitacao.id);

      for (const prompt of prompts) {
        if (prompt.ordem < ordemInicio) continue;

        const parametros = await ParametroRepository.getParametrosByPrompt(prompt.id);
        const substituicoes = this.prepareSubstituicoes(parametros, resultadoGlobal);
        const promptConteudo = this.replacePlaceholders(prompt.conteudo, substituicoes);

        const resultado = await LLMIntegration.processPrompt(promptConteudo, prompt.engine, prompt.modelo);

        console.log('segue prompt:');
        console.log(promptConteudo);

        // Processar o resultado para adicionar ao resultadoGlobal
        for (const [key, value] of Object.entries(resultado)) {
          if (Array.isArray(value)) {
            // Se o valor é um array, incluir cada elemento no formato "key.index"
            value.forEach((item, index) => {
              resultadoGlobal[`${key}.${index}`] = item;
            });
          } else {
            // Caso contrário, adicionar diretamente
            resultadoGlobal[key] = value;
          }
        }
        await PromptResultadoRepository.insertPromptResultado(solicitacao.id, prompt.id, JSON.stringify(resultado));
      }

      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'concluido', JSON.stringify(resultadoGlobal));
    } catch (error) {
      console.error('Erro ao retomar processamento:', error);
      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'erro');
    }
  },

  prepareSubstituicoes(parametros, resultadoGlobal) {
    const substituicoes = { ...resultadoGlobal };
    for (const parametro of parametros) {
      substituicoes[parametro.nome] = parametro.valor;
    }
    return substituicoes;
  },

  replacePlaceholders(content, substituicoes) {
    return content.replace(/\{\{(.*?)\}\}/g, (_, key) => substituicoes[key.trim()] || '');
  },

  async loadResultadosGlobais(solicitacaoId) {
    const resultados = await PromptResultadoRepository.getResultadosBySolicitacao(solicitacaoId);
    return resultados.reduce((acumulado, resultado) => {
      const parsed = JSON.parse(resultado.resultado);
      return { ...acumulado, ...parsed };
    }, {});
  },
};
