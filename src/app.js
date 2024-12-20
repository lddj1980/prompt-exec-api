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
            resolution: {
              type: 'string',
              description: 'Resolução da imagem gerada (ex.: "1024x1024")',
              example: '1024x1024',
            },
            color_depth: {
              type: 'string',
              description: 'Profundidade de cor (ex.: "8-bit", "16-bit")',
              example: '8-bit',
            },
          },
        },
        DefaultModelParameters: {
          type: 'object',
          description: 'Parâmetros genéricos para outras engines',
          additionalProperties: true,
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