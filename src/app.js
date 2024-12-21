const express = require('express');
const router = require('./routes/index');const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cron = require('node-cron');
const DatabaseRepository = require('./data/DatabaseRepository');
const TableCleanerService = require('./services/TableCleanerService');
const pool = require('./config/database');

const dbRepository = new DatabaseRepository(pool);
const tableCleanerService = new TableCleanerService(dbRepository);
// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.1.0', // Especificação OpenAPI 3.0
    info: {
      title: 'API de Comandos',
      version: '1.0.0',
      description: 'Documentação da API para executar comandos.',
    },
    components: {
      schemas: {
        DallEModelParameters: {
          type: 'object',
          description: 'Parâmetros específicos para a engine dall-e',
          properties: {
            n: {
              type: 'integer',
              description: 'Número de imagens desejadas para geração',
              example: 1,
            },
            size: {
              type: 'string',
              description: 'Resolução da imagem desejada',
              example: '1024x1024',
            },
          },
        },
        DefaultModelParameters: {
          type: 'object',
          description: 'Parâmetros genéricos para outras engines',
          additionalProperties: true,
        },
        "OpenAIModelParameters": {
          "type": "object",
          "description": "Parâmetros para interações com a engine OpenAI.",
          "properties": {
            "max_tokens": {
              "type": "integer",
              "description": "O número máximo de tokens permitidos na resposta. Necessário para interações de texto.",
              "example": 1000
            },
            "image_url": {
              "type": "string",
              "format": "uri",
              "description": "URL da imagem a ser analisada. Necessário para interações baseadas em imagens.",
              "example": "https://example.com/my-image.jpg"
            }
          },
          "oneOf": [
            {
              "required": ["max_tokens"]
            },
            {
              "required": ["image_url"]
            }
          ]
        },        
      },
    },    
    servers: [
      {
        url: 'https://promptexec-api.glitch.me', // URL base da API
        description: 'Servidor',
      },
    ],
  },
  apis: ['./src/controllers/*.js'], // Arquivo(s) onde estão os comentários @swagger
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const app = express();
app.use(express.json());
app.use(router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

const PORT = process.env.PORT || 3000;


cron.schedule('0 0 1 * *', async () => {
    try {
        console.log('Iniciando limpeza das tabelas...');
        await tableCleanerService.cleanTables();
    } catch (error) {
        console.error('Erro durante o agendamento:', error);
    } finally {
        await dbRepository.closeConnection();
    }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});