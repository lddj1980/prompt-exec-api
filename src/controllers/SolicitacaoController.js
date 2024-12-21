const { v4: uuidv4 } = require('uuid');
const SolicitacaoRepository = require('../data/SolicitacaoRepository');
const SolicitacaoAgendamentoRepository = require('../data/SolicitacaoAgendamentoRepository');
const PromptRepository = require('../data/PromptRepository');
const ParametroRepository = require('../data/ParametroRepository');
const ProcessingService = require('../services/ProcessingService');

module.exports = {

/**
 * @swagger
 * /solicitacoes:
 *   post:
 *     summary: Cria uma nova solicitação de processamento
 *     description: Cria uma solicitação contendo prompts e seus respectivos parâmetros, associados a um cronograma de execução.
 *     operationId: createSolicitacao
 *     tags:
 *       - Solicitacoes
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         required: true
 *         description: Chave de autenticação para a API
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cron_expression:
 *                 type: string
 *                 description: Expressão cron para agendamento do processamento dos prompts.
 *               cron_start_at:
 *                 type: string
 *                 format: date-time
 *                 description: Data de início da validade do cronograma (opcional).
 *               cron_end_at:
 *                 type: string
 *                 format: date-time
 *                 description: Data de término da validade do cronograma (opcional).
 *               prompts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     prompt:
 *                       type: string
 *                       description: Texto do prompt a ser processado
 *                     engine:
 *                       type: string
 *                       description: Nome da engine associada
 *                       enum:
 *                       - brainstorm-ai
 *                       - dall-e
 *                       - carousel
 *                       - freepikapi-text-to-image
 *                       - gemini
 *                       - html-to-image
 *                       - image-repo
 *                       - inferenceapi-text-to-image
 *                       - inferenceapi-text-generation
 *                       - inferenceapi-text-to-audio
 *                       - inferenceapi-text-to-speech
 *                       - instagram
 *                       - openai
 *                       - telegram
 *                       - writter-ai
 *                       - wordpress
 *                       - whatsapp
 *                     model:
 *                       type: string
 *                       description: Modelo utilizado pela engine
 *                     model_parameters:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/BrainstormAIModelParameters'
 *                         - $ref: '#/components/schemas/CarouselModelParameters'
 *                         - $ref: '#/components/schemas/DallEModelParameters'
 *                         - $ref: '#/components/schemas/FreepikModelParameters'
 *                         - $ref: '#/components/schemas/GeminiModelParameters'
 *                         - $ref: '#/components/schemas/HTMLToImageModelParameters'
 *                         - $ref: '#/components/schemas/OpenAIModelParameters'
 *                         - $ref: '#/components/schemas/ImageRepoModelParameters'
 *                         - $ref: '#/components/schemas/DefaultModelParameters'
 *                       discriminator:
 *                         propertyName: engine
 *                         mapping:
 *                           brainstorm-ai: '#/components/schemas/BrainstormAIModelParameters'
 *                           carousel: '#/components/schemas/CarouselModelParameters'
 *                           dall-e: '#/components/schemas/DallEModelParameters'
 *                           freepikapi-text-to-image: '#/components/schemas/FreepikModelParameters'
 *                           gemini: '#/components/schemas/GeminiModelParameters'
 *                           html-to-image: '#/components/schemas/HTMLToImageModelParameters'
 *                           image-repo: '#/components/schemas/ImageRepoModelParameters'
 *                           default: '#/components/schemas/DefaultModelParameters'
 *                     prompt_parameters:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Nome do parâmetro
 *                           value:
 *                             type: string
 *                             description: Valor do parâmetro
 *                 required: [prompt, engine, model]
 *     responses:
 *       202:
 *         description: Solicitação criada com sucesso e processamento iniciado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 protocoloUid:
 *                   type: string
 *                   description: Identificador único do protocolo da solicitação
 *       400:
 *         description: Requisição inválida (dados incorretos ou ausentes)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 */
  async create(req, res) {
    try {
      const { prompts, cron_expression, start_at, end_at } = req.body;
      
      if (!prompts || !Array.isArray(prompts)) {
        return res.status(400).json({ error: 'Prompts inválidos.' });
      }

      console.log(req.body);
      const protocoloUid = uuidv4();
      const solicitacaoId = await SolicitacaoRepository.createSolicitacao(protocoloUid);
      SolicitacaoAgendamentoRepository.insertAgendamento(solicitacaoId, cron_expression, start_at, end_at);
      
      for (const [index, prompt] of prompts.entries()) {
 
        const promptId = await PromptRepository.insertPrompt(
          solicitacaoId,
          prompt.prompt,
          prompt.engine,
          prompt.model,
          index + 1,
          prompt.model_parameters
        );

        if (prompt.prompt_parameters && Array.isArray(prompt.prompt_parameters)) {
          for (const parametro of prompt.prompt_parameters) {
            await ParametroRepository.insertParametro(promptId, parametro.name, parametro.value);
          }
        }
      }

      res.status(202).json({ protocoloUid });
      if (!cron_expression){
        ProcessingService.process(protocoloUid);
      }
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  /**
 * @swagger
 * /solicitacoes/{protocoloUid}/progress:
 *   get:
 *     summary: Obtém o progresso da solicitação
 *     description: Retorna o status e os prompts processados da solicitação.
 *     operationId: getProgress
 *     tags:
 *       - Solicitacoes
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         required: true
 *         description: Chave de autenticação da API
 *         schema:
 *           type: string
 *       - name: protocoloUid
 *         in: path
 *         required: true
 *         description: Identificador único da solicitação.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progresso da solicitação retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status da solicitação.
 *                 prompts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       prompt:
 *                         type: string
 *       404:
 *         description: Solicitação não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
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

/**
 * @swagger
 * /solicitacoes/{protocoloUid}/resultado:
 *   get:
 *     summary: Obtém o resultado da solicitação
 *     description: Retorna o resultado processado da solicitação.
 *     operationId: getResultado
 *     tags:
 *       - Solicitacoes
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         required: true
 *         description: Chave de autenticação da API
 *         schema:
 *           type: string
 *       - name: protocoloUid
 *         in: path
 *         required: true
 *         description: Identificador único da solicitação.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado da solicitação retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultado:
 *                   type: string
 *                   description: Resultado da solicitação em formato JSON.
 *               example:
 *                 resultado: "{\"data\": {\"key\": \"value\"}}"
 *       404:
 *         description: Solicitação não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */

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

  /**
 * @swagger
 * /solicitacoes/{protocoloUid}/resume:
 *   post:
 *     summary: Retoma o processamento da solicitação
 *     description: Endpoint para retomar o processamento de uma solicitação em andamento.
 *     operationId: resumeSolicitacao
 *     tags:
 *       - Solicitacoes
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         required: true
 *         description: Chave de autenticação da API
 *         schema:
 *           type: string
 *       - name: protocoloUid
 *         in: path
 *         required: true
 *         description: Identificador único da solicitação.
 *         schema:
 *           type: string
 *     responses:
 *       202:
 *         description: Processamento retomado com sucesso.
 *       400:
 *         description: Solicitação já foi concluída.
 *       404:
 *         description: Solicitação não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
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
  
  /**
 * @swagger
 * /solicitacoes/{protocoloUid}:
 *   delete:
 *     summary: Exclui uma solicitação por protocolo
 *     description: Remove a solicitação e seus agendamentos associados com base no identificador único do protocolo.
 *     operationId: deleteSolicitacaoByProtocolo
 *     tags:
 *       - Solicitacoes
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         required: true
 *         description: Chave de autenticação para a API
 *         schema:
 *           type: string
 *       - name: protocoloUid
 *         in: path
 *         required: true
 *         description: Identificador único do protocolo da solicitação
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solicitação excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmação da exclusão
 *       400:
 *         description: Requisição inválida (dados incorretos ou ausentes)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *       404:
 *         description: Solicitação ou agendamentos não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 */
  async deleteByProtocolo(req, res) {
  try {
    const { protocoloUid } = req.params;

    if (!protocoloUid) {
      return res.status(400).json({ error: 'Protocolo inválido ou ausente.' });
    }

    // Obter o ID da solicitação pelo protocolo
    const solicitacaoId = await SolicitacaoRepository.getSolicitacaoIdByProtocolo(protocoloUid);
    if (!solicitacaoId) {
      return res.status(404).json({ error: 'Solicitação não encontrada.' });
    }

    // Excluir agendamentos associados
    await SolicitacaoAgendamentoRepository.deleteAgendamentosBySolicitacao(solicitacaoId);

    // Excluir a solicitação
    await SolicitacaoRepository.deleteSolicitacao(solicitacaoId);

    res.status(200).json({ message: 'Solicitação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir solicitação:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
},
 /**
 * @swagger
 * /solicitacoes/{protocoloUid}/process:
 *   post:
 *     summary: Processa uma solicitação (mesmo já tendo concluído)
 *     description: Endpoint para processar uma solicitação
 *     operationId: processarSolicitacao
 *     tags:
 *       - Solicitacoes
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         required: true
 *         description: Chave de autenticação da API
 *         schema:
 *           type: string
 *       - name: protocoloUid
 *         in: path
 *         required: true
 *         description: Identificador único da solicitação.
 *         schema:
 *           type: string
 *     responses:
 *       202:
 *         description: Processamento retomado com sucesso.
 *       404:
 *         description: Solicitação não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
  async process(req, res) {
    try {
      const { protocoloUid } = req.params;

      const solicitacao = await SolicitacaoRepository.getSolicitacaoByProtocolo(protocoloUid);
      if (!solicitacao) {
        return res.status(404).json({ error: 'Solicitação não encontrada.' });
      }

      await ProcessingService.process(protocoloUid);

      res.status(202).json({ message: 'Processamento realizado.' });
    } catch (error) {
      console.error('Erro ao realizar o processamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },  
  
};
