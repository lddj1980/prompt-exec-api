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
 *                       required: [engine, model, model_parameters]
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
 *                         prompt:
 *                           type: string
 *                           description: Prompt que vai ser solicitado ao OpenAI
 *                       required: [engine, model, prompt]
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
 *                         prompt:
 *                           type: string
 *                           description: Prompt que vai ser solicitado ao DALL-E para gerar a imagem
 *                       required: [engine, model, prompt]
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
 *                       required: [engine, model, model_parameters]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["elevenlabs-text-to-speech"]
 *                           description: Engine Elevenlabs para conversão de texto para audio
 *                         model:
 *                           type: string
 *                           enum: ["eleven_multilingual_v2","eleven_turbo_v2_5","eleven_turbo_v2","eleven_flash_v2","eleven_monolingual_v1"]
 *                           default: eleven_multilingual_v2         
 *                           description: Modelos suportados para Engine Elevenlabs para conversão de texto para audio
 *                         model_parameters:
 *                           $ref: '#/components/schemas/ElevenLabsModelParameters'
 *                         prompt:
 *                           type: string
 *                           description: Prompt como o texto que vai ser solicitado para transformar em audio
 *                       required: [engine, model, prompt, model_parameters]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["email"]
 *                           description: Engine Email para envio de mensagens
 *                         model_parameters:
 *                           $ref: '#/components/schemas/EmailServiceModelParameters'
 *                       required: [engine, model_parameters] 
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
 *                         prompt:
 *                           type: string
 *                           description: Prompt que vai ser solicitado ao freepik para gerar a imagem
 *                       required: [engine, model, prompt, model_parameters]
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
 *                         prompt:
 *                           type: string
 *                           description: Prompt que vai ser solicitado ao gemini
 *                       required: [engine, model, prompt]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["html-to-image"]
 *                           description: Engine HTML-to-Image
 *                         model:
 *                           type: string
 *                           enum: ["nome"]
 *                           description: Modelos suportados para HTML-to-Image
 *                         model_parameters:
 *                           $ref: '#/components/schemas/HTMLToImageModelParameters'
 *                       required: [engine, model, model_parameters]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["http-command"]
 *                           description: Engine Http-Command
 *                         model:
 *                           type: string
 *                           enum: ["nome"]
 *                           description: Modelos suportados para Http-Command
 *                         model_parameters:
 *                           $ref: '#/components/schemas/HttpCommandModelParameters'
 *                       required: [engine, model, model_parameters] 
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
 *                       required: [engine, model, model_parameters]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["imap"]
 *                           description: Engine Imap
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Imap
 *                         model_parameters:
 *                           $ref: '#/components/schemas/IMAPModelParameters'
 *                       required: [engine, model, model_parameters] 
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["image-to-video"]
 *                           description: Engine VideoGeneration
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para VideoGeneration
 *                         model_parameters:
 *                           $ref: '#/components/schemas/VideoGenerationParameters'
 *                       required: [engine, model, model_parameters]  
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["inferenceapi-text-to-audio"]
 *                           description: Engine Inference API Text-to-Audio
 *                         model:
 *                           type: string
 *                           enum: ["facebook/musicgen-small"]
 *                           default: facebook/musicgen-small
 *                           description: Modelos suportados para Inference API Text-to-Audio
 *                         model_parameters:
 *                           $ref: '#/components/schemas/InferenceAPITextToAudioModelParameters'
 *                         prompt:
 *                           type: string
 *                           description: Prompt que vai ser solicitado ao inferenceapi para gerar audio
 *                       required: [engine, model, prompt]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["inferenceapi-text-to-image"]
 *                           description: Engine Inference API Text-to-Image
 *                         model:
 *                           type: string
 *                           enum: ["black-forest-labs/FLUX.1-dev","stable-diffusion-3.5-large","fofr/flux-handwriting","stable-diffusion-v1-5/stable-diffusion-v1-5","prashanth970/flux-lora-uncensored"]
 *                           default: black-forest-labs/FLUX.1-dev
 *                           description: Modelos suportados para Inference API Text-to-Image
 *                         model_parameters:
 *                           $ref: '#/components/schemas/InferenceAPITextToImageModelParameters'
 *                         prompt:
 *                           type: string
 *                           description: Prompt que vai ser solicitado ao inferenceapi para gerar a imagem
 *                       required: [engine, model, prompt]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["inferenceapi-text-generation"]
 *                           description: Engine Inference API Text Generation
 *                         model:
 *                           type: string
 *                           enum: ["meta-llama/Llama-3.3-70B-Instruct","Qwen/Qwen2.5-72B-Instruct","openai-community/gpt2","google/gemma-7b"]
 *                           default: meta-llama/Llama-3.3-70B-Instruct
 *                           description: Modelos suportados para Inference API Text Generation
 *                         model_parameters:
 *                           $ref: '#/components/schemas/InferenceAPITextGenerationModelParameters'
 *                         prompt:
 *                           type: string
 *                           description: Prompt que vai ser solicitado ao inferenceapi para text generation
 *                       required: [engine, model, prompt]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["inferenceapi-text-to-speech"]
 *                           description: Engine Inference API Text To Speech
 *                         model:
 *                           type: string
 *                           enum: ["facebook/fastspeech2-en-ljspeech"]
 *                           default: facebook/fastspeech2-en-ljspeech
 *                           description: Modelos suportados para Inference API Text To Speech
 *                         model_parameters:
 *                           $ref: '#/components/schemas/InferenceAPIIntegrationTextToSpeechModelParameters'
 *                         prompt:
 *                           type: string
 *                           description: Prompt que vai ser solicitado ao inferenceapi para text to speech
 *                       required: [engine, model, prompt] 
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["instagram"]
 *                           description: Engine Instagram
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Instagram
 *                         model_parameters:
 *                           $ref: '#/components/schemas/InstagramModelParameters'
 *                       required: [engine, model, model_parameters]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["mysql"]
 *                           description: Engine Instagram
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Mysql
 *                         model_parameters:
 *                           $ref: '#/components/schemas/MySQLIntegrationModelParameters'
 *                       required: [engine, model, model_parameters]
  *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["pexels"]
 *                           description: Engine Pexels
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Mysql
 *                         model_parameters:
 *                           $ref: '#/components/schemas/PexelsModelParameters'
 *                       required: [engine, model, model_parameters]
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
 *                       required: [engine, model, model_parameters]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["threads"]
 *                           description: Engine Threads
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Threads
 *                         model_parameters:
 *                           $ref: '#/components/schemas/ThreadsModelParameters'
 *                       required: [engine, model, model_parameters] 
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["whatsapp"]
 *                           description: Engine WhatsApp
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para WhatsApp
 *                         model_parameters:
 *                           $ref: '#/components/schemas/WhatsappModelParameters'
 *                       required: [engine, model, model_parameters]
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
 *                           $ref: '#/components/schemas/WordpressModelParameters'
 *                       required: [engine, model, model_parameters]
 *                     - type: object
 *                       properties:
 *                         engine:
 *                           type: string
 *                           enum: ["writter-ai"]
 *                           description: Engine Writter-AI
 *                         model:
 *                           type: string
 *                           enum: ["none"]
 *                           description: Modelos suportados para Writter-AI
 *                         model_parameters:
 *                           $ref: '#/components/schemas/WritterAIModelParameters'
 *                       required: [engine, model, model_parameters]
 *             required: [prompts]
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
