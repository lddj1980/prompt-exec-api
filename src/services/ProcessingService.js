const SolicitacaoRepository = require('../data/SolicitacaoRepository');
const PromptRepository = require('../data/PromptRepository');
const ParametroRepository = require('../data/ParametroRepository');
const PromptResultadoRepository = require('../data/PromptResultadoRepository');
const PromptProcessorService = require('./PromptProcessorService');

module.exports = {
  
  async process(protocoloUid) {
    try {
      const solicitacao = await SolicitacaoRepository.getSolicitacaoByProtocolo(protocoloUid);
      if (!solicitacao) throw new Error('Solicitação não encontrada.');

      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'em_progresso');

      const prompts = await PromptRepository.getPromptsBySolicitacao(solicitacao.id);
      console.log('prompts:'+prompts);
      const resultadoGlobal = {};
      const resultadoBd = {};
      var resultadoFinal = {};
      for (const prompt of prompts) {
        console.log(resultadoGlobal);
        const parametros = await ParametroRepository.getParametrosByPrompt(prompt.id);
        const substituicoes = this.prepareSubstituicoes(parametros, resultadoGlobal);

        const promptConteudo = this.replacePlaceholders(prompt.prompt, substituicoes);
        const parametrosModeloAtualizados = this.replacePlaceholdersInJson(prompt.parametros_modelo, substituicoes);

        console.log('Segue prompt:');
        console.log(promptConteudo);

        const resultado = await PromptProcessorService.processPrompt(
          promptConteudo,
          prompt.engine,
          prompt.modelo,
          parametrosModeloAtualizados
        );

        // Atualizar resultadoBd com o resultado atual
        Object.assign(resultadoBd, resultado);

        // Processar recursivamente os resultados para o resultadoGlobal
        this.processNestedResult(resultadoGlobal, resultado);

        await PromptResultadoRepository.insertPromptResultado(solicitacao.id, prompt.id, JSON.stringify(resultado));
        resultadoFinal = JSON.stringify(resultado);
      }
      //console.log(JSON.stringify(resultadoFinal));
      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'concluido', resultadoFinal);
    } catch (error) {
      console.error('Erro no processamento:', error);
      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'erro');
    }
  },

  processNestedResult(resultadoGlobal, resultado, prefix = '') {
    for (const [key, value] of Object.entries(resultado)) {
      const prefixedKey = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            this.processNestedResult(resultadoGlobal, item, `${prefixedKey}.${index}`);
          } else {
            resultadoGlobal[`${prefixedKey}.${index}`] = item;
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        this.processNestedResult(resultadoGlobal, value, prefixedKey);
      } else {
        resultadoGlobal[prefixedKey] = value;
      }
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
    return content
      ? content.replace(/\{\{(.*?)\}\}/g, (_, key) => substituicoes[key.trim()] || '')
      : null;
  },

  replacePlaceholdersInJson(json, substituicoes) {
    if (Array.isArray(json)) {
      return json.map(item => this.replacePlaceholdersInJson(item, substituicoes));
    } else if (typeof json === 'object' && json !== null) {
      const updatedJson = {};
      for (const [key, value] of Object.entries(json)) {
        updatedJson[key] = this.replacePlaceholdersInJson(value, substituicoes);
      }
      return updatedJson;
    } else if (typeof json === 'string') {
      return this.replacePlaceholders(json, substituicoes);
    } else {
      return json;
    }
  },

  async loadResultadosGlobais(solicitacaoId) {
    const resultados = await PromptResultadoRepository.getResultadosBySolicitacao(solicitacaoId);
    return resultados.reduce((acumulado, resultado) => {
      const parsed = JSON.parse(resultado.resultado);
      return { ...acumulado, ...parsed };
    }, {});
  },

  async resume(protocoloUid) {
    try {
      const solicitacao = await SolicitacaoRepository.getSolicitacaoByProtocolo(protocoloUid);
      if (!solicitacao) throw new Error('Solicitação não encontrada.');

      if (solicitacao.status === 'concluido') {
        console.log('Solicitação já concluída.');
        return;
      }

      var resultadoFinal = {};
      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'em_progresso');

      const prompts = await PromptRepository.getPromptsBySolicitacao(solicitacao.id);
      const ultimoPromptResultado = await PromptResultadoRepository.getUltimoPromptResultado(solicitacao.id);
      const ordemInicio = ultimoPromptResultado ? ultimoPromptResultado.ordem + 1 : 1;

      const resultadoGlobal = this.loadResultadosGlobais(solicitacao.id);

      for (const prompt of prompts) {
        if (prompt.ordem < ordemInicio) continue;

        const parametros = await ParametroRepository.getParametrosByPrompt(prompt.id);
        const substituicoes = this.prepareSubstituicoes(parametros, resultadoGlobal);

        const promptConteudo = this.replacePlaceholders(prompt.prompt, substituicoes);
        const parametrosModeloAtualizados = this.replacePlaceholdersInJson(prompt.parametros_modelo, substituicoes);

        const resultado = await PromptProcessorService.processPrompt(
          promptConteudo,
          prompt.engine,
          prompt.modelo,
          parametrosModeloAtualizados
        );

        console.log('Segue prompt:');
        console.log(promptConteudo);

        // Processar recursivamente os resultados para o resultadoGlobal
        this.processNestedResult(resultadoGlobal, resultado);

        await PromptResultadoRepository.insertPromptResultado(solicitacao.id, prompt.id, JSON.stringify(resultado));
        resultadoFinal = JSON.stringify(resultado);
      }

      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'concluido', resultadoFinal);
    } catch (error) {
      console.error('Erro ao retomar processamento:', error);
      await SolicitacaoRepository.updateSolicitacaoStatus(protocoloUid, 'erro');
    }
  },
};
