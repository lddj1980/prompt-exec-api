const { v4: uuidv4 } = require('uuid');
const SolicitacaoRepository = require('../data/SolicitacaoRepository');
const PromptRepository = require('../data/PromptRepository');
const ParametroRepository = require('../data/ParametroRepository');
const ProcessingService = require('../services/ProcessingService');

module.exports = {
  
  

/**
 * @swagger
 * /solicitacoes:
 *   post:
 *     summary: Cria uma nova solicitação de processamento
 *     description: Endpoint para criar uma nova solicitação utilizando prompts. A solicitação é processada em background.
 *     operationId: createSolicitacao
 *     tags:
 *       - Solicitacoes
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         required: true
 *         description: Chave de autenticação da API
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:

               - type: object
                 description: Configuração específica para a engine brainstorm-ai
                 properties:
                   engine:
                     type: string
                     enum: ["brainstorm-ai"]
                     description: A engine utilizada para o processamento brainstorm-ai
                   model:
                     type: string
                     description: O modelo da engine utilizado brainstorm-ai
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine brainstorm-ai
                   model_parameters:
                     type: object
                     properties:
    
                     description: Nenhum parâmetro específico para esta engine brainstorm-ai
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine carousel
                 properties:
                   engine:
                     type: string
                     enum: ["carousel"]
                     description: A engine utilizada para o processamento carousel
                   model:
                     type: string
                     description: O modelo da engine utilizado carousel 
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine carousel
                   model_parameters:
                     type: object
                     properties:
    
                     description: Nenhum parâmetro específico para esta engine
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine dall-e
                 properties:
                   engine:
                     type: string
                     enum: ["dall-e"]
                     description: A engine utilizada para o processamento dall-e
                   model:
                     type: string
                     description: O modelo da engine utilizado dall-e
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine dall-e
                   model_parameters:
                     type: object
                     properties:
    
                       n:
                         type: string
                         description: Parâmetro n para a engine dall-e
            
                       size:
                         type: string
                         description: Parâmetro size para a engine dall-e
            
                     required: ['n', 'size']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine freepikapi-text-to-image
                 properties:
                   engine:
                     type: string
                     enum: ["freepikapi-text-to-image"]
                     description: A engine utilizada para o processamento freepikapi-text-to-image
                   model:
                     type: string
                     description: O modelo da engine utilizado freepikapi-text-to-image
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine freepikapi-text-to-image
                   model_parameters:
                     type: object
                     properties:
    
                       styling:
                         type: string
                         description: Parâmetro styling para a engine freepikapi-text-to-image
            
                       guidance_scale:
                         type: string
                         description: Parâmetro guidance_scale para a engine freepikapi-text-to-image
            
                       negative_prompt:
                         type: string
                         description: Parâmetro negative_prompt para a engine freepikapi-text-to-image
            
                       seed:
                         type: string
                         description: Parâmetro seed para a engine freepikapi-text-to-image
            
                       image:
                         type: string
                         description: Parâmetro image para a engine freepikapi-text-to-image
            
                       num_images:
                         type: string
                         description: Parâmetro num_images para a engine freepikapi-text-to-image
            
                     required: ['styling', 'guidance_scale', 'negative_prompt', 'seed', 'image', 'num_images']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine gemini
                 properties:
                   engine:
                     type: string
                     enum: ["gemini"]
                     description: A engine utilizada para o processamento gemini
                   model:
                     type: string
                     description: O modelo da engine utilizado gemini
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine gemini
                   model_parameters:
                     type: object
                     properties:
    
                       imageUrl:
                         type: string
                         description: Parâmetro imageUrl para a engine gemini
            
                     required: ['imageUrl']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine html-to-image
                 properties:
                   engine:
                     type: string
                     enum: ["html-to-image"]
                     description: A engine utilizada para o processamento html-to-image
                   model:
                     type: string
                     description: O modelo da engine utilizado html-to-image
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine html-to-image
                   model_parameters:
                     type: object
                     properties:
    
                       username:
                         type: string
                         description: Parâmetro username para a engine html-to-image
            
                       action:
                         type: string
                         description: Parâmetro action para a engine html-to-image
            
                       html:
                         type: string
                         description: Parâmetro html para a engine html-to-image
            
                       height:
                         type: string
                         description: Parâmetro height para a engine html-to-image
            
                       apiKey:
                         type: string
                         description: Parâmetro apiKey para a engine html-to-image
            
                       css:
                         type: string
                         description: Parâmetro css para a engine html-to-image
            
                       baseURL:
                         type: string
                         description: Parâmetro baseURL para a engine html-to-image
            
                       width:
                         type: string
                         description: Parâmetro width para a engine html-to-image
            
                     required: ['username', 'action', 'html', 'height', 'apiKey', 'css', 'baseURL', 'width']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine image-repo
                 properties:
                   engine:
                     type: string
                     enum: ["image-repo"]
                     description: A engine utilizada para o processamento image-repo
                   model:
                     type: string
                     description: O modelo da engine utilizado image-repo
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine image-repo
                   model_parameters:
                     type: object
                     properties:
    
                       ftpConfigId:
                         type: string
                         description: Parâmetro ftpConfigId para a engine image-repo
            
                       action:
                         type: string
                         description: Parâmetro action para a engine image-repo
            
                       base64:
                         type: string
                         description: Parâmetro base64 para a engine image-repo
            
                       metadata:
                         type: string
                         description: Parâmetro metadata para a engine image-repo
            
                       imageUrl:
                         type: string
                         description: Parâmetro imageUrl para a engine image-repo
            
                       extension:
                         type: string
                         description: Parâmetro extension para a engine image-repo
            
                       apiKey:
                         type: string
                         description: Parâmetro apiKey para a engine image-repo
            
                       baseURL:
                         type: string
                         description: Parâmetro baseURL para a engine image-repo
            
                     required: ['ftpConfigId', 'action', 'base64', 'metadata', 'imageUrl', 'extension', 'apiKey', 'baseURL']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine inferenceapi-text-generation
                 properties:
                   engine:
                     type: string
                     enum: ["inferenceapi-text-generation"]
                     description: A engine utilizada para o processamento inferenceapi-text-generation
                   model:
                     type: string
                     description: O modelo da engine utilizado inferenceapi-text-generation
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine inferenceapi-text-generation
                   model_parameters:
                     type: object
                     properties:
    
                     description: Nenhum parâmetro específico para esta engine
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine inferenceapi-text-to-audio
                 properties:
                   engine:
                     type: string
                     enum: ["inferenceapi-text-to-audio"]
                     description: A engine utilizada para o processamento inferenceapi-text-to-audio
                   model:
                     type: string
                     description: O modelo da engine utilizado inferenceapi-text-to-audio
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine inferenceapi-text-to-audio
                   model_parameters:
                     type: object
                     properties:
    
                     description: Nenhum parâmetro específico para esta engine
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine inferenceapi-text-to-image
                 properties:
                   engine:
                     type: string
                     enum: ["inferenceapi-text-to-image"]
                     description: A engine utilizada para o processamento inferenceapi-text-to-image
                   model:
                     type: string
                     description: O modelo da engine utilizado inferenceapi-text-to-image
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine inferenceapi-text-to-image
                   model_parameters:
                     type: object
                     properties:
    
                     description: Nenhum parâmetro específico para esta engine
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine inferenceapi-text-to-speech
                 properties:
                   engine:
                     type: string
                     enum: ["inferenceapi-text-to-speech"]
                     description: A engine utilizada para o processamento inferenceapi-text-to-speech
                   model:
                     type: string
                     description: O modelo da engine utilizado inferenceapi-text-to-speech
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine inferenceapi-text-to-speech
                   model_parameters:
                     type: object
                     properties:
    
                     description: Nenhum parâmetro específico para esta engine
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine instagram
                 properties:
                   engine:
                     type: string
                     enum: ["instagram"]
                     description: A engine utilizada para o processamento instagram
                   model:
                     type: string
                     description: O modelo da engine utilizado instagram
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine instagram
                   model_parameters:
                     type: object
                     properties:
    
                       action:
                         type: string
                         description: Parâmetro action para a engine instagram
            
                       apiBaseUrl:
                         type: string
                         description: Parâmetro apiBaseUrl para a engine instagram
            
                       mediaUrl:
                         type: string
                         description: Parâmetro mediaUrl para a engine instagram
            
                       slides:
                         type: string
                         description: Parâmetro slides para a engine instagram
            
                       caption:
                         type: string
                         description: Parâmetro caption para a engine instagram
            
                       videoUrl:
                         type: string
                         description: Parâmetro videoUrl para a engine instagram
            
                       apiKey:
                         type: string
                         description: Parâmetro apiKey para a engine instagram
            
                       mediaType:
                         type: string
                         description: Parâmetro mediaType para a engine instagram
            
                     required: ['action', 'apiBaseUrl', 'mediaUrl', 'slides', 'caption', 'videoUrl', 'apiKey', 'mediaType']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine openai
                 properties:
                   engine:
                     type: string
                     enum: ["openai"]
                     description: A engine utilizada para o processamento openai
                   model:
                     type: string
                     description: O modelo da engine utilizado openai
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine openai
                   model_parameters:
                     type: object
                     properties:
    
                       max_tokens:
                         type: string
                         description: Parâmetro max_tokens para a engine openai
            
                       imageUrl:
                         type: string
                         description: Parâmetro imageUrl para a engine openai
            
                     required: ['max_tokens', 'imageUrl']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine telegram
                 properties:
                   engine:
                     type: string
                     enum: ["telegram"]
                     description: A engine utilizada para o processamento telegram
                   model:
                     type: string
                     description: O modelo da engine utilizado telegram
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine telegram
                   model_parameters:
                     type: object
                     properties:
    
                       question:
                         type: string
                         description: Parâmetro question para a engine telegram
            
                       action:
                         type: string
                         description: Parâmetro action para a engine telegram
            
                       photoUrl:
                         type: string
                         description: Parâmetro photoUrl para a engine telegram
            
                       options:
                         type: string
                         description: Parâmetro options para a engine telegram
            
                       videoPath:
                         type: string
                         description: Parâmetro videoPath para a engine telegram
            
                       caption:
                         type: string
                         description: Parâmetro caption para a engine telegram
            
                       message:
                         type: string
                         description: Parâmetro message para a engine telegram
            
                       documentPath:
                         type: string
                         description: Parâmetro documentPath para a engine telegram
            
                       botToken:
                         type: string
                         description: Parâmetro botToken para a engine telegram
            
                       audioPath:
                         type: string
                         description: Parâmetro audioPath para a engine telegram
            
                       channelId:
                         type: string
                         description: Parâmetro channelId para a engine telegram
            
                     required: ['question', 'action', 'photoUrl', 'options', 'videoPath', 'caption', 'message', 'documentPath', 'botToken', 'audioPath', 'channelId']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine whatsapp
                 properties:
                   engine:
                     type: string
                     enum: ["whatsapp"]
                     description: A engine utilizada para o processamento whatsapp
                   model:
                     type: string
                     description: O modelo da engine utilizado whatsapp
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine whatsapp
                   model_parameters:
                     type: object
                     properties:
    
                       groupId:
                         type: string
                         description: Parâmetro groupId para a engine whatsapp
            
                       action:
                         type: string
                         description: Parâmetro action para a engine whatsapp
            
                       mimeType:
                         type: string
                         description: Parâmetro mimeType para a engine whatsapp
            
                       mediaUrl:
                         type: string
                         description: Parâmetro mediaUrl para a engine whatsapp
            
                       caption:
                         type: string
                         description: Parâmetro caption para a engine whatsapp
            
                       message:
                         type: string
                         description: Parâmetro message para a engine whatsapp
            
                       apiKey:
                         type: string
                         description: Parâmetro apiKey para a engine whatsapp
            
                       fileName:
                         type: string
                         description: Parâmetro fileName para a engine whatsapp
            
                       baseURL:
                         type: string
                         description: Parâmetro baseURL para a engine whatsapp
            
                       number:
                         type: string
                         description: Parâmetro number para a engine whatsapp
            
                     required: ['groupId', 'action', 'mimeType', 'mediaUrl', 'caption', 'message', 'apiKey', 'fileName', 'baseURL', 'number']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine wordpress
                 properties:
                   engine:
                     type: string
                     enum: ["wordpress"]
                     description: A engine utilizada para o processamento wordpress
                   model:
                     type: string
                     description: O modelo da engine utilizado
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine wordpress
                   model_parameters:
                     type: object
                     properties:
    
                       slug:
                         type: string
                         description: Parâmetro slug para a engine wordpress
            
                       title:
                         type: string
                         description: Parâmetro title para a engine wordpress
            
                       author:
                         type: string
                         description: Parâmetro author para a engine wordpress
            
                       webhookURL:
                         type: string
                         description: Parâmetro webhookURL para a engine wordpress
            
                       featureMediaId:
                         type: string
                         description: Parâmetro featureMediaId para a engine wordpress
            
                       excerpt:
                         type: string
                         description: Parâmetro excerpt para a engine wordpress
            
                       content:
                         type: string
                         description: Parâmetro content para a engine wordpress
            
                       parentObjectId:
                         type: string
                         description: Parâmetro parentObjectId para a engine wordpress
            
                     required: ['slug', 'title', 'author', 'webhookURL', 'featureMediaId', 'excerpt', 'content', 'parentObjectId']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
               - type: object
                 description: Configuração específica para a engine writter-ai
                 properties:
                   engine:
                     type: string
                     enum: ["writter-ai"]
                     description: A engine utilizada para o processamento writter-ai
                   model:
                     type: string
                     description: O modelo da engine utilizado writter-ai
                   prompt:
                     type: string
                     description: O texto inicial a ser processado pela engine writter-ai
                   model_parameters:
                     type: object
                     properties:
    
                       action:
                         type: string
                         description: Parâmetro action para a engine writter-ai
            
                       writerId:
                         type: string
                         description: Parâmetro writerId para a engine writter-ai
            
                       tituloId:
                         type: string
                         description: Parâmetro tituloId para a engine writter-ai
            
                       apiKey:
                         type: string
                         description: Parâmetro apiKey para a engine writter-ai
            
                       conteudo:
                         type: string
                         description: Parâmetro conteudo para a engine writter-ai
            
                     required: ['action', 'writerId', 'tituloId', 'apiKey', 'conteudo']
        
                 required: ["engine", "model", "prompt", "model_parameters"]
    
     responses:
       200:
         description: Solicitação criada com sucesso
         content:
           application/json:
             schema:
               type: object
               properties:
                 id:
                   type: string
                   description: ID único da solicitação
                 status:
                   type: string
                   description: Status inicial da solicitação
                   enum: ["created", "processing", "completed"]
       400:
         description: Requisição inválida
       401:
         description: Não autorizado
       500:
         description: Erro interno do servidor
 */
  async create(req, res) {
    try {
      const { prompts } = req.body;
      
      const cron_expression = req.headers['x-cron-expression'];
      const start_at = req.headers['x-cron-start-at'];
      const end_at = req.headers['x-cron-end-at'];

      if (!prompts || !Array.isArray(prompts)) {
        return res.status(400).json({ error: 'Prompts inválidos.' });
      }

      console.log(req.body);
      const protocoloUid = uuidv4();
      const solicitacaoId = await SolicitacaoRepository.createSolicitacao(protocoloUid);
      
      for (const [index, prompt] of prompts.entries()) {
 
        const promptId = await PromptRepository.insertPrompt(
          solicitacaoId,
          prompt.prompt,
          prompt.engine,
          prompt.model,
          index + 1,
          prompt.model_parameters,
          cron_expression,
          start_at,
          end_at
        );

        if (prompt.prompt_parameters && Array.isArray(prompt.prompt_parameters)) {
          for (const parametro of prompt.prompt_parameters) {
            await ParametroRepository.insertParametro(promptId, parametro.name, parametro.value);
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
 * /api/v1/solicitacoes/{protocoloUid}/resultado:
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
};
