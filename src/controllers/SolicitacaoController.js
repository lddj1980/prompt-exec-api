const { v4: uuidv4 } = require('uuid');
const SolicitacaoRepository = require('../data/SolicitacaoRepository');
const SolicitacaoAgendamentoRepository = require('../data/SolicitacaoAgendamentoRepository');
const PromptRepository = require('../data/PromptRepository');
const ParametroRepository = require('../data/ParametroRepository');
const ProcessingService = require('../services/ProcessingService');

module.exports = {


/**                       - inferenceapi-text-generation
 *                       - inferenceapi-text-to-audio
 *                       - inferenceapi-text-to-speech
 *                       - instagram
 *                       - writter-ai
 *                       - wordpress
 *                       - whatsapp
*/
  
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
 *                   oneOf:
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["brainstorm-ai"]
 *                           description: Engine para Criação de Brainstorms 
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados na BrainstormAI
 *                         model_parameters:
 *                           $ref: '#/components/schemas/BrainstormAIModelParameters'
 *                       required: [engine, model]

 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["openai"]
 *                           description: Engine OpenAI
 *                         model:
 *                           type: string
 *                           enum: ["gpt-4o"]
 *                           default: gpt-4o
 *                           description: Modelos suportados para OpenAI
 *                         model_parameters:
 *                           $ref: '#/components/schemas/OpenAIModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["dall-e"]
 *                           description: Engine DALL-E
 *                         model:
 *                           type: string
 *                           enum: ["dall-e-2", "dall-e-3"]
 *                           default: dall-e-3
 *                           description: Modelos suportados para DALL-E
 *                         model_parameters:
 *                           $ref: '#/components/schemas/DallEModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["carousel"]
 *                           description: Engine Carousel
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Carousel
 *                         model_parameters:
 *                           $ref: '#/components/schemas/CarouselModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["freepikapi-text-to-image"]
 *                           description: Engine Freepik API
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Freepik API
 *                         model_parameters:
 *                           $ref: '#/components/schemas/FreepikModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["gemini"]
 *                           description: Engine Gemini
 *                         model:
 *                           type: string
 *                           enum: ["gemini-1.5-flash"]
 *                           default: gemini-1.5-flash
 *                           description: Modelos suportados para Gemini
 *                         model_parameters:
 *                           $ref: '#/components/schemas/GeminiModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Engine HTML-to-Image
 *                         model:
 *                           type: string
 *                           enum: ["html-image-basic", "html-image-advanced"]
 *                           description: Modelos suportados para HTML-to-Image
 *                         model_parameters:
 *                           $ref: '#/components/schemas/HTMLToImageModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["image-repo"]
 *                           description: Engine Image Repository
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Image Repository
 *                         model_parameters:
 *                           $ref: '#/components/schemas/ImageRepoModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["inferenceapi-text-to-image"]
 *                           description: Engine Inference API Text-to-Image
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Inference API Text-to-Image
 *                         model_parameters:
 *                           $ref: '#/components/schemas/InferenceAPITextToImageModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["inferenceapi-text-generation"]
 *                           description: Engine Inference API Text Generation
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Inference API Text Generation
 *                         model_parameters:
 *                           $ref: '#/components/schemas/InferenceAPITextGenerationModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["telegram"]
 *                           description: Engine Telegram
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Telegram
 *                         model_parameters:
 *                           $ref: '#/components/schemas/TelegramModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["wordpress"]
 *                           description: Engine WordPress
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para WordPress
 *                         model_parameters:
 *                           $ref: '#/components/schemas/WordPressModelParameters'
 *                       required: [engine, model]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Engine WhatsApp
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para WhatsApp
 *                         model_parameters:
 *                           $ref: '#/components/schemas/WhatsAppModelParameters'
 *                       required: [engine, model]
 *             required: [cron_expression, prompts]
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
      
      if (cron_expression){
        SolicitacaoAgendamentoRepository.insertAgendamento(solicitacaoId, cron_expression, start_at, end_at);
      }
      
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
 * /solicitacoes/{protocoloUid}/result:
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
