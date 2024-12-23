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
      title: 'API para gestão de pipelines de prompts de integração',
      version: '1.0.0',
      description: 'Documentação da API que permite fazer a gestão de pipelines de prompts de integração. Ela permite compor múltiplos comandos aninhados em formato de pipelines. É possível solicitar a criação da pipeline para execução imediata ou agendada, acompanhar o progresso da pipeline, obter os resultados gerados, resumir a execução, executar ou obter os resultados do processamento.',
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
        "GeminiModelParameters": {
          "type": "object",
          "description": "Parâmetros para interações com a engine Gemini.",
          "properties": {
            "image_url": {
              "type": "string",
              "format": "uri",
              "description": "URL da imagem a ser analisada pela engine Gemini.",
              "example": "https://example.com/my-image.jpg"
            }
          },
          "required": ["image_url"]
        },   
        "BrainstormAIModelParameters": {
            "type": "object",
            "description": "Parâmetros para integração com o Brainstorm AI.",
            "properties": {
              "api_key": {
                "type": "string",
                "description": "Chave de API para autenticação no Brainstorm AI."
              },
              "action": {
                "type": "string",
                "description": "Ação a ser executada pela integração.",
                "enum": ["execute", "getLastTitles", "createTitles"]
              },
              "writer_id": {
                "type": "string",
                "description": "ID do redator associado à ação."
              },
              "titles": {
                "type": "array",
                "description": "Lista de títulos a serem criados (apenas para a ação 'createTitles').",
                "items": {
                  "type": "string"
                }
              }
            },
            "required": ["api_key"],
            "oneOf": [
              {
                "description": "Parâmetros para a ação 'execute'.",
                "properties": {
                  "action": {
                    "const": "execute"
                  },
                  "writer_id": {
                    "type": "string",
                    "description": "ID do redator associado à ação."
                  }
                },
                "required": ["action", "writer_id"]
              },
              {
                "description": "Parâmetros para a ação 'getLastTitles'.",
                "properties": {
                  "action": {
                    "const": "getLastTitles"
                  },
                  "writer_id": {
                    "type": "string",
                    "description": "ID do redator associado à ação."
                  }
                },
                "required": ["action", "writer_id"]
              },
              {
                "description": "Parâmetros para a ação 'createTitles'.",
                "properties": {
                  "action": {
                    "const": "createTitles"
                  },
                  "writer_id": {
                    "type": "string",
                    "description": "ID do redator associado à ação."
                  },
                  "titles": {
                    "type": "array",
                    "description": "Lista de títulos a serem criados.",
                    "items": {
                      "type": "string"
                    }
                  }
                },
                "required": ["action", "writer_id", "titles"]
              }
            ]
        },
        "CarouselModelParameters": {
            "type": "object",
            "description": "Parâmetros para integração com o Carousel API.",
            "properties": {
              "api_key": {
                "type": "string",
                "description": "Chave de API para autenticação no Carousel API."
              },
              "base_url": {
                "type": "string",
                "format": "uri",
                "description": "Base URL para o serviço Carousel API."
              },
              "action": {
                "type": "string",
                "description": "Ação a ser executada pela integração.",
                "enum": ["generateCarousel", "getProgress", "getCarousel"]
              },
              "payload": {
                "type": "object",
                "description": "Carga de dados necessária para gerar um carousel (apenas para a ação 'generateCarousel').",
                "additionalProperties": true
              },
              "progress_id": {
                "type": "string",
                "description": "ID do progresso associado à geração do carousel (apenas para a ação 'getProgress')."
              },
              "carousel_id": {
                "type": "string",
                "description": "ID do carousel gerado (apenas para a ação 'getCarousel')."
              }
            },
            "required": ["api_key"],
            "oneOf": [
              {
                "description": "Parâmetros para a ação 'generateCarousel'.",
                "properties": {
                  "action": {
                    "const": "generateCarousel"
                  },
                  "payload": {
                    "type": "object",
                    "description": "Carga de dados para gerar o carousel.",
                    "additionalProperties": true
                  }
                },
                "required": ["action", "payload"]
              },
              {
                "description": "Parâmetros para a ação 'getProgress'.",
                "properties": {
                  "action": {
                    "const": "getProgress"
                  },
                  "progress_id": {
                    "type": "string",
                    "description": "ID do progresso associado à geração do carousel."
                  }
                },
                "required": ["action", "progress_id"]
              },
              {
                "description": "Parâmetros para a ação 'getCarousel'.",
                "properties": {
                  "action": {
                    "const": "getCarousel"
                  },
                  "carousel_id": {
                    "type": "string",
                    "description": "ID do carousel gerado."
                  }
                },
                "required": ["action", "carousel_id"]
              }
            ]
          },
          "FreepikModelParameters": {
            "type": "object",
            "description": "Parâmetros para integração com a API Freepik Text-to-Image.",
            "properties": {
              "negative_prompt": {
                "type": "object",
                "description": "Prompt negativo para controlar os elementos a serem evitados na geração da imagem.",
                "additionalProperties": true
              },
              "guidance_scale": {
                "type": "number",
                "description": "Fator de ajuste para influenciar o resultado da imagem. O valor padrão é 1.",
                "example": 1
              },
              "seed": {
                "type": "integer",
                "description": "Semente para a geração de imagens determinísticas. O valor padrão é 0.",
                "example": 42
              },
              "num_images": {
                "type": "integer",
                "description": "Número de imagens a serem geradas. O valor padrão é 1.",
                "example": 5
              },
              "image": {
                "type": "object",
                "description": "Configuração do tamanho da imagem.",
                "properties": {
                  "size": {
                    "type": "string",
                    "description": "Tamanho da imagem gerada. O valor padrão é 'square_1_1'.",
                    "enum": ["square_1_1", "landscape", "portrait"],
                    "example": "landscape"
                  }
                },
                "required": ["size"]
              },
              "styling": {
                "type": "object",
                "description": "Estilização adicional para a geração de imagens.",
                "additionalProperties": true
              }
            },
            "required": ["negative_prompt", "guidance_scale", "seed", "num_images", "image"]
        },
        "HTMLToImageModelParameters": {
            "type": "object",
            "description": "Parâmetros para integração com o serviço HTMLToImageService.",
            "properties": {
              "api_key": {
                "type": "string",
                "description": "Chave de API para autenticação no HTMLToImageService."
              },
              "username": {
                "type": "string",
                "description": "Nome de usuário associado à conta no HTMLToImageService."
              },
              "base_url": {
                "type": "string",
                "format": "uri",
                "description": "URL base do serviço HTMLToImageService.",
                "default": "https://default-base-url.com"
              },
              "action": {
                "type": "string",
                "description": "Ação a ser executada. Atualmente, apenas 'generateImage' é suportado.",
                "enum": ["generateImage"]
              },
              "html": {
                "type": "string",
                "description": "Conteúdo HTML que será convertido em imagem."
              },
              "width": {
                "type": "integer",
                "description": "Largura da imagem gerada. Valor padrão: 1080.",
                "default": 1080,
                "example": 1080
              },
              "height": {
                "type": "integer",
                "description": "Altura da imagem gerada. Valor padrão: 1920.",
                "default": 1920,
                "example": 1920
              },
              "css": {
                "type": "string",
                "description": "CSS adicional para estilizar o conteúdo HTML antes de gerar a imagem.",
                "default": "",
                "example": "body { background-color: #000; }"
              }
            },
            "required": ["api_key", "username", "action", "html"],
            "oneOf": [
              {
                "description": "Parâmetros para a ação 'generateImage'.",
                "properties": {
                  "action": {
                    "const": "generateImage"
                  },
                  "html": {
                    "type": "string",
                    "description": "Conteúdo HTML que será convertido em imagem."
                  },
                  "width": {
                    "type": "integer",
                    "description": "Largura da imagem gerada.",
                    "default": 1080
                  },
                  "height": {
                    "type": "integer",
                    "description": "Altura da imagem gerada.",
                    "default": 1920
                  },
                  "css": {
                    "type": "string",
                    "description": "CSS adicional para estilizar o conteúdo HTML.",
                    "default": ""
                  }
                },
                "required": ["action", "html"]
              }
            ]
          },       
          "ImageRepoModelParameters": {
            "type": "object",
            "description": "Parâmetros para integração com o serviço ImageRepoService.",
            "properties": {
              "apiKey": {
                "type": "string",
                "description": "Chave de API para autenticação no ImageRepoService."
              },
              "baseURL": {
                "type": "string",
                "format": "uri",
                "description": "URL base do serviço ImageRepoService.",
                "default": "https://default-base-url.com"
              },
              "action": {
                "type": "string",
                "description": "Ação a ser executada. Atualmente, apenas 'createImage' é suportado.",
                "enum": ["createImage"]
              },
              "image_url": {
                "type": "string",
                "format": "uri",
                "description": "URL da imagem a ser salva no repositório."
              },
              "metadata": {
                "type": "object",
                "description": "Metadados associados à imagem.",
                "properties": {
                  "description": {
                    "type": "string",
                    "description": "Descrição da imagem.",
                    "default": ""
                  },
                  "tags": {
                    "type": "array",
                    "description": "Lista de tags associadas à imagem.",
                    "items": {
                      "type": "string"
                    },
                    "default": []
                  }
                }
              },
              "extension": {
                "type": "string",
                "description": "Extensão do arquivo de imagem.",
                "enum": [".jpg", ".png", ".gif"],
                "default": ".jpg"
              },
              "ftp_config_id": {
                "type": "integer",
                "description": "ID da configuração do FTP para upload da imagem."
              },
              "base64": {
                "type": "boolean",
                "description": "Indica se o conteúdo da imagem está em Base64.",
                "default": false
              }
            },
            "required": ["apiKey", "action", "image_url", "metadata", "extension", "ftp_config_id"],
            "oneOf": [
              {
                "description": "Parâmetros para a ação 'createImage'.",
                "properties": {
                  "action": {
                    "const": "createImage"
                  },
                  "image_url": {
                    "type": "string",
                    "format": "uri",
                    "description": "URL da imagem a ser salva no repositório."
                  },
                  "metadata": {
                    "type": "object",
                    "description": "Metadados associados à imagem.",
                    "properties": {
                      "description": {
                        "type": "string",
                        "description": "Descrição da imagem.",
                        "default": ""
                      },
                      "tags": {
                        "type": "array",
                        "description": "Lista de tags associadas à imagem.",
                        "items": {
                          "type": "string"
                        },
                        "default": []
                      }
                    }
                  },
                  "extension": {
                    "type": "string",
                    "description": "Extensão do arquivo de imagem.",
                    "enum": [".jpg", ".png", ".gif"],
                    "default": ".jpg"
                  },
                  "ftp_config_id": {
                    "type": "integer",
                    "description": "ID da configuração do FTP para upload da imagem."
                  },
                  "base64": {
                    "type": "boolean",
                    "description": "Indica se o conteúdo da imagem está em Base64.",
                    "default": false
                  }
                },
                "required": ["action", "image_url", "metadata", "extension", "ftp_config_id"]
              }
            ]
          },  
          "InferenceAPITextToImageModelParameters": {
              "type": "object",
              "description": "Parâmetros para integração com a Inference API do Hugging Face para modelos text-to-image.",
              "properties": {
                "model": {
                  "type": "string",
                  "description": "Modelo a ser usado na Inference API do Hugging Face para modelos text-to-image.",
                  "example": "gpt-neo-1.3B"
                },
                "prompt": {
                  "type": "string",
                  "description": "Texto de entrada a ser processado pelo modelo para modelos text-to-image.",
                  "example": "Explique a teoria da gravidade."
                },
                "api_key": {
                  "type": "string",
                  "description": "Chave de API para autenticação no Hugging Face para modelos text-to-image.",
                  "default": "HUGGINGFACE_API_KEY"
                },
                "wait_for_model": {
                  "type": "boolean",
                  "description": "Indica se a requisição deve aguardar o modelo ficar disponível.",
                  "default": true
                }
              },
              "required": ["model", "prompt"],
              "additionalProperties": false
          },  
          "ElevenLabsModelParameters": {
              "type": "object",
              "description": "Parâmetros para integração com a API ElevenLabs para conversão de texto em fala.",
              "properties": {
                "voice_id": {
                  "type": "string",
                  "description": "ID da voz a ser usada para gerar o áudio. Devem ser identificadas em https://api.elevenlabs.io/v1/voices",
                  "example": "21m00Tcm4TlvDq8ikWAM",
                  "default": "e1NiSFBUD04sZQ0bZgTP"
                },
                "model": {
                  "type": "string",
                  "description": "Modelo a ser utilizado para conversão de texto em fala.",
                  "example": "eleven_multilingual_v2",
                  "default": "eleven_multilingual_v2"
                },
                "prompt": {
                  "type": "string",
                  "description": "Texto a ser convertido em áudio.",
                  "example": "Olá, este é um exemplo de áudio gerado pela ElevenLabs."
                },
                "api_key": {
                  "type": "string",
                  "description": "Chave de API para autenticação na API ElevenLabs."
                }
              },
              "required": ["voice_id", "model", "prompt"]
            },        
            "InferenceAPITextGenerationModelParameters": {
                "type": "object",
                "description": "Parâmetros para integração com a Inference API do Hugging Face, focada em modelos de geração de texto.",
                "properties": {
                  "api_key": {
                    "type": "string",
                    "description": "Chave de API para autenticação na Inference API do Hugging Face. Se não fornecida, será usada a variável de ambiente `HUGGINGFACE_API_KEY`."
                  },
                  "prompt": {
                    "type": "string",
                    "description": "Texto de entrada que será processado pelo modelo de geração de texto.",
                    "example": "Explique a teoria da gravidade."
                  },
                  "model": {
                    "type": "string",
                    "description": "Nome do modelo Hugging Face utilizado para geração de texto.",
                    "example": "gpt-neo-2.7B"
                  }
                },
                "required": ["prompt", "model"]
            },                    
            DefaultModelParameters: {
              type: 'object',
              description: 'Parâmetros genéricos para outras engines',
              properties: {}
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