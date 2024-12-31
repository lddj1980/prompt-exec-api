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
                "parameters": {
                  "type": "object",
                  "description": "Parametros opcionais para o modelo.",
                }
              }
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
                }
              },
              "required": ["voice_id"]
            },        
            "InferenceAPITextGenerationModelParameters": {
                "type": "object",
                "description": "Parâmetros para integração com a Inference API do Hugging Face, focada em modelos de geração de texto.",
                "properties": {
                  "api_key": {
                    "type": "string",
                    "description": "Chave de API para autenticação na Inference API do Hugging Face. Se não fornecida, será usada a variável de ambiente `HUGGINGFACE_API_KEY`."
                  }
                }
            },   
            "InferenceAPITextToAudioModelParameters": {
              "type": "object",
              "description": "Parâmetros para integração com a Inference API do Hugging Face, focada em modelos de geração de áudio.",
              "properties": {
                "parameters": {
                  "type": "object",
                  "description": "Parametros opcionais que serão enviados ao modelo para geração de áudio."
                }
              }
            }, 
            "InferenceAPITextToSpeechModelParameters": {
              "type": "object",
              "description": "Parâmetros para integração com a Inference API do Hugging Face, focada em modelos de geração de voz.",
              "properties": {
                "parameters": {
                  "type": "object",
                  "description": "Parametros opcionais que serão enviados ao modelo para geração de voz."
                }
              }
            },   
            "InstagramModelParameters": {
              "type": "object",
              "description": "Parâmetros para integração com a API do Instagram.",
              "properties": {
                "api_key": {
                  "type": "string",
                  "description": "Chave de API para autenticação na API do Instagram.",
                  "example": "your_api_key"
                },
                "api_base_url": {
                  "type": "string",
                  "description": "URL base da API do Instagram.",
                  "example": "https://graph.instagram.com/"
                },
                "action": {
                  "type": "string",
                  "description": "Ação a ser realizada na API do Instagram.",
                  "enum": ["publishPost", "publishCarousel", "publishReel", "publishStory"],
                  "example": "publishPost"
                },
                "media_url": {
                  "type": "string",
                  "description": "URL da mídia a ser publicada (imagem ou vídeo). Obrigatório para `publishPost` e `publishStory`.",
                  "example": "https://example.com/media.jpg"
                },
                "media_type": {
                  "type": "string",
                  "description": "Tipo de mídia para stories (`image` ou `video`). Obrigatório para `publishStory`.",
                  "enum": ["image", "video"],
                  "example": "image"
                },
                "caption": {
                  "type": "string",
                  "description": "Legenda opcional para a publicação.",
                  "example": "Veja nosso novo post!"
                },
                "slides": {
                  "type": "array",
                  "description": "Lista de URLs de mídia para um carrossel. Obrigatório para `publishCarousel`.",
                  "items": {
                    "type": "string"
                  },
                  "example": ["https://example.com/slide1.jpg", "https://example.com/slide2.jpg"]
                },
                "video_url": {
                  "type": "string",
                  "description": "URL do vídeo a ser publicado como reel. Obrigatório para `publishReel`.",
                  "example": "https://example.com/video.mp4"
                }
              },
              "required": ["api_key", "action"],
              "oneOf": [
                {
                  "description": "Parâmetros para publicar um post.",
                  "properties": {
                    "action": {
                      "const": "publishPost"
                    },
                    "media_url": {
                      "type": "string"
                    }
                  },
                  "required": ["media_url"]
                },
                {
                  "description": "Parâmetros para publicar um carrossel.",
                  "properties": {
                    "action": {
                      "const": "publishCarousel"
                    },
                    "slides": {
                      "type": "array"
                    }
                  },
                  "required": ["slides"]
                },
                {
                  "description": "Parâmetros para publicar um reel.",
                  "properties": {
                    "action": {
                      "const": "publishReel"
                    },
                    "video_url": {
                      "type": "string"
                    }
                  },
                  "required": ["video_url"]
                },
                {
                  "description": "Parâmetros para publicar um story.",
                  "properties": {
                    "action": {
                      "const": "publishStory"
                    },
                    "media_url": {
                      "type": "string"
                    },
                    "media_type": {
                      "type": "string"
                    }
                  },
                  "required": ["media_url", "media_type"]
                }
              ]
            },   
            "WhatsappModelParameters": {
              "type": "object",
              "description": "Parâmetros para integração com o WhatsApp Proxy API.",
              "properties": {
                "api_key": {
                  "type": "string",
                  "description": "Chave de API para autenticação na API do WhatsApp.",
                  "example": "your_api_key"
                },
                "base_url": {
                  "type": "string",
                  "description": "URL base da API do WhatsApp.",
                  "example": "https://whatsapp.example.com/api"
                },
                "action": {
                  "type": "string",
                  "description": "Ação a ser realizada na API do WhatsApp.",
                  "enum": ["sendMessage", "sendMedia", "sendGroupMessage"],
                  "example": "sendMessage"
                },
                "number": {
                  "type": "string",
                  "description": "Número de telefone do destinatário, no formato internacional.",
                  "example": "+5511999999999"
                },
                "message": {
                  "type": "string",
                  "description": "Texto da mensagem a ser enviada. Obrigatório para 'sendMessage' e 'sendGroupMessage'.",
                  "example": "Olá, tudo bem?"
                },
                "media_url": {
                  "type": "string",
                  "description": "URL do arquivo de mídia a ser enviado. Obrigatório para 'sendMedia'.",
                  "example": "https://example.com/image.jpg"
                },
                "mime_type": {
                  "type": "string",
                  "description": "Tipo MIME do arquivo de mídia. Obrigatório para 'sendMedia'.",
                  "example": "image/jpeg"
                },
                "file_name": {
                  "type": "string",
                  "description": "Nome do arquivo de mídia. Obrigatório para 'sendMedia'.",
                  "example": "imagem.jpg"
                },
                "caption": {
                  "type": "string",
                  "description": "Legenda opcional para a mídia enviada em 'sendMedia'.",
                  "example": "Esta é uma imagem de exemplo."
                },
                "group_id": {
                  "type": "string",
                  "description": "ID do grupo para o qual a mensagem será enviada. Obrigatório para 'sendGroupMessage'.",
                  "example": "1234567890@g.us"
                }
              },
              "required": ["apiKey", "action"],
              "oneOf": [
                {
                  "description": "Parâmetros para enviar uma mensagem de texto.",
                  "properties": {
                    "action": {
                      "const": "sendMessage"
                    },
                    "number": {
                      "type": "string"
                    },
                    "message": {
                      "type": "string"
                    }
                  },
                  "required": ["number", "message"]
                },
                {
                  "description": "Parâmetros para enviar uma mensagem com mídia.",
                  "properties": {
                    "action": {
                      "const": "sendMedia"
                    },
                    "number": {
                      "type": "string"
                    },
                    "media_url": {
                      "type": "string"
                    },
                    "mime_type": {
                      "type": "string"
                    },
                    "file_name": {
                      "type": "string"
                    }
                  },
                  "required": ["number", "media_url", "mime_type", "file_name"]
                },
                {
                  "description": "Parâmetros para enviar uma mensagem para um grupo.",
                  "properties": {
                    "action": {
                      "const": "sendGroupMessage"
                    },
                    "group_id": {
                      "type": "string"
                    },
                    "message": {
                      "type": "string"
                    }
                  },
                  "required": ["group_id", "message"]
                }
              ]
            },
            "TelegramModelParameters": {
              "type": "object",
              "description": "Parâmetros para integração com o Telegram Bot API.",
              "properties": {
                "bot_token": {
                  "type": "string",
                  "description": "Token do bot do Telegram para autenticação.",
                  "example": "123456789:ABCDefGhIjKlMnOpQrStUvWxYz1234567890"
                },
                "channel_id": {
                  "type": "string",
                  "description": "ID do canal ou chat no Telegram onde a ação será realizada.",
                  "example": "@meu_canal_telegram"
                },
                "action": {
                  "type": "string",
                  "description": "Ação a ser realizada no Telegram.",
                  "enum": [
                    "sendMessage",
                    "sendPoll",
                    "sendPhoto",
                    "sendDocument",
                    "sendVideo",
                    "sendAudio"
                  ],
                  "example": "sendMessage"
                },
                "message": {
                  "type": "string",
                  "description": "Texto da mensagem a ser enviada. Obrigatório para 'sendMessage'.",
                  "example": "Olá, esta é uma mensagem enviada pelo bot!"
                },
                "question": {
                  "type": "string",
                  "description": "Pergunta para a enquete. Obrigatório para 'sendPoll'.",
                  "example": "Qual é a sua cor favorita?"
                },
                "options": {
                  "type": "array",
                  "description": "Lista de opções para a enquete. Obrigatório para 'sendPoll'.",
                  "items": {
                    "type": "string"
                  },
                  "example": ["Azul", "Verde", "Vermelho", "Amarelo"]
                },
                "photo_url": {
                  "type": "string",
                  "description": "URL da foto a ser enviada. Obrigatório para 'sendPhoto'.",
                  "example": "https://example.com/foto.jpg"
                },
                "document_path": {
                  "type": "string",
                  "description": "Caminho do documento a ser enviado. Obrigatório para 'sendDocument'.",
                  "example": "/path/to/document.pdf"
                },
                "video_path": {
                  "type": "string",
                  "description": "Caminho do vídeo a ser enviado. Obrigatório para 'sendVideo'.",
                  "example": "/path/to/video.mp4"
                },
                "audio_path": {
                  "type": "string",
                  "description": "Caminho do áudio a ser enviado. Obrigatório para 'sendAudio'.",
                  "example": "/path/to/audio.mp3"
                },
                "caption": {
                  "type": "string",
                  "description": "Legenda opcional para a mídia (foto, documento, vídeo, ou áudio).",
                  "example": "Veja este arquivo incrível!"
                }
              },
              "required": ["bot_token", "channel_id", "action"],
              "oneOf": [
                {
                  "description": "Parâmetros para enviar uma mensagem de texto.",
                  "properties": {
                    "action": {
                      "const": "sendMessage"
                    },
                    "message": {
                      "type": "string"
                    }
                  },
                  "required": ["message"]
                },
                {
                  "description": "Parâmetros para enviar uma enquete.",
                  "properties": {
                    "action": {
                      "const": "sendPoll"
                    },
                    "question": {
                      "type": "string"
                    },
                    "options": {
                      "type": "array"
                    }
                  },
                  "required": ["question", "options"]
                },
                {
                  "description": "Parâmetros para enviar uma imagem.",
                  "properties": {
                    "action": {
                      "const": "sendPhoto"
                    },
                    "photo_url": {
                      "type": "string"
                    }
                  },
                  "required": ["photo_url"]
                },
                {
                  "description": "Parâmetros para enviar um documento.",
                  "properties": {
                    "action": {
                      "const": "sendDocument"
                    },
                    "document_path": {
                      "type": "string"
                    }
                  },
                  "required": ["document_path"]
                },
                {
                  "description": "Parâmetros para enviar um vídeo.",
                  "properties": {
                    "action": {
                      "const": "sendVideo"
                    },
                    "video_path": {
                      "type": "string"
                    }
                  },
                  "required": ["video_path"]
                },
                {
                  "description": "Parâmetros para enviar um áudio.",
                  "properties": {
                    "action": {
                      "const": "sendAudio"
                    },
                    "audio_path": {
                      "type": "string"
                    }
                  },
                  "required": ["audio_path"]
                }
              ]
            },      

            "WordpressModelParameters": {
              "type": "object",
              "description": "Parâmetros para integração com o WordPress API para publicação de posts.",
              "properties": {
                "webhook_url": {
                  "type": "string",
                  "description": "URL do webhook para envio de notificações. Caso não fornecido, será usado o webhook padrão.",
                  "example": "https://hook.us1.make.com/fy97mitmrsnsy43kaa8x9ousrcy6b2am"
                },
                "title": {
                  "type": "string",
                  "description": "Título do post a ser publicado.",
                  "example": "Como criar integrações automatizadas no WordPress"
                },
                "content": {
                  "type": "string",
                  "description": "Conteúdo do post em formato HTML ou Markdown.",
                  "example": "<p>Este é um exemplo de conteúdo para um post no WordPress.</p>"
                },
                "author": {
                  "type": "string",
                  "description": "Nome do autor do post. Opcional.",
                  "example": "João da Silva"
                },
                "slug": {
                  "type": "string",
                  "description": "Slug do post, utilizado na URL amigável. Opcional.",
                  "example": "como-criar-integracoes-wordpress"
                },
                "excerpt": {
                  "type": "string",
                  "description": "Resumo ou trecho do post. Opcional.",
                  "example": "Aprenda como integrar e automatizar processos no WordPress."
                },
                "feature_media_id": {
                  "type": "integer",
                  "description": "ID da imagem destacada do post no WordPress. Opcional.",
                  "example": 12345
                },
                "parent_object_id": {
                  "type": "integer",
                  "description": "ID do objeto pai para o post, caso aplicável (ex.: ID de um post ao qual este será uma resposta). Opcional.",
                  "example": 67890
                }
              },
              "required": ["title", "content"]
            },
            "WritterAIModelParameters": {
              "type": "object",
              "description": "Parâmetros para integração com a API do Writter-IA.",
              "properties": {
                "api_key": {
                  "type": "string",
                  "description": "Chave de API para autenticação no Writter-IA.",
                  "example": "your_api_key"
                },
                "writer_id": {
                  "type": "string",
                  "description": "Identificador único do redator associado ao conteúdo.",
                  "example": "writer_12345"
                },
                "action": {
                  "type": "string",
                  "description": "Ação a ser realizada na API do Writter-IA.",
                  "enum": ["getOldestUnusedTitle", "generateContent", "savePublication"],
                  "example": "getOldestUnusedTitle"
                },
                "titulo_id": {
                  "type": "string",
                  "description": "Identificador único do título a ser associado à publicação. Obrigatório para 'savePublication'.",
                  "example": "title_67890"
                },
                "conteudo": {
                  "type": "string",
                  "description": "Conteúdo a ser salvo com o título especificado. Obrigatório para 'savePublication'.",
                  "example": "Este é o conteúdo gerado para o título especificado."
                }
              },
              "required": ["api_key", "writer_id", "action"],
              "oneOf": [
                {
                  "description": "Parâmetros para buscar o título mais antigo não utilizado.",
                  "properties": {
                    "action": {
                      "const": "getOldestUnusedTitle"
                    }
                  }
                },
                {
                  "description": "Parâmetros para gerar conteúdo baseado no título mais antigo.",
                  "properties": {
                    "action": {
                      "const": "generateContent"
                    }
                  }
                },
                {
                  "description": "Parâmetros para salvar uma publicação.",
                  "properties": {
                    "action": {
                      "const": "savePublication"
                    },
                    "titulo_id": {
                      "type": "string"
                    },
                    "conteudo": {
                      "type": "string"
                    }
                  },
                  "required": ["titulo_id", "conteudo"]
                }
              ]
            },
            "HttpCommandModelParameters": {
              "type": "object",
              "description": "Parâmetros para configuração e integração com a API genérica.",
              "properties": {
                "base_url": {
                  "type": "string",
                  "description": "URL base da API para as requisições.",
                  "example": "https://api.example.com/v1"
                },
                "endpoint": {
                  "type": "string",
                  "description": "Endpoint da API que será chamado.",
                  "example": "/execute"
                },
                "method": {
                  "type": "string",
                  "description": "Método HTTP para a requisição.",
                  "enum": ["GET", "POST", "PUT", "DELETE"],
                  "example": "POST"
                },
                "headers": {
                  "type": "object",
                  "description": "Cabeçalhos adicionais para a requisição.",
                  "example": {
                    "Authorization": "Bearer your_api_key",
                    "Content-Type": "application/json"
                  }
                },
                "body": {
                  "type": "object",
                  "description": "Dados do corpo da requisição para métodos POST ou PUT.",
                  "example": {
                    "key1": "value1",
                    "key2": "value2"
                  }
                },
                "params": {
                  "type": "object",
                  "description": "Parâmetros de query opcionais para a requisição.",
                  "example": {
                    "queryParam1": "value1",
                    "queryParam2": "value2"
                  }
                },
                "timeout": {
                  "type": "integer",
                  "description": "Tempo máximo em milissegundos para a requisição. Valor padrão: 5000.",
                  "example": 10000
                },
                "request_id": {
                  "type": "string",
                  "description": "Identificador único para a requisição. Gerado automaticamente se não for fornecido.",
                  "example": "custom-request-id-12345"
                }
              },
              "required": ["base_url", "endpoint", "method"]
            },     
            "ThreadsModelParameters": {
              "type": "object",
              "description": "Parâmetros para integração com o Threads API.",
              "properties": {
                "api_key": {
                  "type": "string",
                  "description": "Token de acesso para autenticação no Threads API.",
                  "example": "your_access_token"
                },
                "action": {
                  "type": "string",
                  "description": "Ação a ser realizada na API Threads.",
                  "enum": ["publishPost", "publishCarousel"],
                  "example": "publishPost",
                  "default":"publishPost"
                },
                "media_type": {
                  "type": "string",
                  "description": "Tipo de mídia a ser publicada. Obrigatório para 'publishPost'.",
                  "enum": ["IMAGE", "VIDEO"],
                  "example": "IMAGE",
                  "default":"IMAGE"
                },
                "text": {
                  "type": "string",
                  "description": "Texto associado à publicação. Opcional para ambas as ações.",
                  "example": "Este é o texto da publicação."
                },
                "image_url": {
                  "type": "string",
                  "format": "uri",
                  "description": "URL da imagem a ser publicada. Obrigatório se 'media_type' for 'image'.",
                  "example": "https://example.com/image.jpg"
                },
                "video_url": {
                  "type": "string",
                  "format": "uri",
                  "description": "URL do vídeo a ser publicado. Obrigatório se 'media_type' for 'video'.",
                  "example": "https://example.com/video.mp4"
                },
                "items": {
                  "type": "array",
                  "description": "Lista de objetos representando os itens do carrossel. Obrigatório para 'publishCarousel'.",
                  "items": {
                    "type": "object",
                    "properties": {
                      "media_type": {
                        "type": "string",
                        "description": "Tipo de mídia para o item do carrossel.",
                        "enum": ["image", "video"],
                        "example": "image"
                      },
                      "image_url": {
                        "type": "string",
                        "format": "uri",
                        "description": "URL da imagem para o item do carrossel. Obrigatório se 'media_type' for 'image'.",
                        "example": "https://example.com/carousel-image.jpg"
                      },
                      "video_url": {
                        "type": "string",
                        "format": "uri",
                        "description": "URL do vídeo para o item do carrossel. Obrigatório se 'media_type' for 'video'.",
                        "example": "https://example.com/carousel-video.mp4"
                      }
                    },
                    "required": ["media_type"]
                  }
                }
              },
              "required": ["api_key", "action"],
              "oneOf": [
                {
                  "description": "Parâmetros para publicar um post no Threads.",
                  "properties": {
                    "action": {
                      "const": "publishPost"
                    },
                    "media_type": {
                      "type": "string",
                      "enum": ["image", "video"]
                    }
                  },
                  "required": ["media_type"]
                },
                {
                  "description": "Parâmetros para publicar um carrossel no Threads.",
                  "properties": {
                    "action": {
                      "const": "publishCarousel"
                    },
                    "items": {
                      "type": "array",
                      "minItems": 2
                    }
                  },
                  "required": ["items"]
                }
              ]
            },      
            "EmailServiceModelParameters": {
                "type": "object",
                "description": "Parâmetros para integração com o serviço externo de envio de e-mails.",
                "properties": {
                  "from": {
                    "type": "string",
                    "format": "email",
                    "description": "Endereço de e-mail do remetente.",
                    "example": "sender@example.com"
                  },
                  "to": {
                    "type": "string",
                    "format": "email",
                    "description": "Endereço de e-mail do destinatário.",
                    "example": "recipient@example.com"
                  },
                  "subject": {
                    "type": "string",
                    "description": "Assunto do e-mail.",
                    "example": "Assunto do E-mail"
                  },
                  "body": {
                    "type": "string",
                    "description": "Conteúdo do e-mail.",
                    "example": "Este é o corpo do e-mail enviado pelo serviço externo."
                  }
                },
                "required": ["from", "to", "subject", "body"]
              },     
              "IMAPModelParameters": {
                  "type": "object",
                  "description": "Parâmetros para integração com servidores IMAP.",
                  "properties": {
                    "user": {
                      "type": "string",
                      "description": "Nome de usuário para autenticação no servidor IMAP.",
                      "example": "user@example.com"
                    },
                    "password": {
                      "type": "string",
                      "description": "Senha do usuário para autenticação no servidor IMAP.",
                      "example": "your_password"
                    },
                    "host": {
                      "type": "string",
                      "description": "Host do servidor IMAP.",
                      "example": "imap.example.com"
                    },
                    "port": {
                      "type": "integer",
                      "description": "Porta para conexão com o servidor IMAP.",
                      "example": 993
                    },
                    "tls": {
                      "type": "boolean",
                      "description": "Indica se a conexão deve usar TLS (Transport Layer Security). O padrão é true.",
                      "example": true
                    },
                    "responseKey": {
                      "type": "string",
                      "description": "Chave de resposta para organizar os resultados no JSON de saída.",
                      "example": "imapResponse"
                    }
                  },
                  "required": ["user", "password", "host", "port", "responseKey"]
                },    
                "MySQLIntegrationModelParameters": {
                    "type": "object",
                    "description": "Parâmetros para a integração com um banco de dados MySQL.",
                    "properties": {
                      "host": {
                        "type": "string",
                        "description": "Endereço do servidor MySQL.",
                        "example": "localhost"
                      },
                      "user": {
                        "type": "string",
                        "description": "Usuário para autenticação no banco de dados.",
                        "example": "root"
                      },
                      "password": {
                        "type": "string",
                        "description": "Senha para autenticação do usuário no banco de dados.",
                        "example": "my_password"
                      },
                      "database": {
                        "type": "string",
                        "description": "Nome do banco de dados a ser utilizado.",
                        "example": "my_database"
                      },
                      "port": {
                        "type": "integer",
                        "description": "Porta para conexão ao banco de dados MySQL. O valor padrão é 3306.",
                        "example": 3306,
                        "default": 3306
                      },
                      "query": {
                        "type": "string",
                        "description": "Consulta SQL a ser executada no banco de dados.",
                        "example": "SELECT * FROM users WHERE id = ?"
                      },
                      "values": {
                        "type": "array",
                        "description": "Valores para as variáveis na consulta SQL (placeholders ?).",
                        "items": {
                          "type": "string"
                        },
                        "example": ["1"]
                      },
                      "responseKey": {
                        "type": "string",
                        "description": "Chave para organizar os resultados na resposta JSON.",
                        "example": "mysqlResponse",
                        "default": "mysqlResponse"
                      }
                    },
                    "required": ["host", "user", "password", "database", "query"]
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