const axios = require('axios');

module.exports = {
  
  async process(prompt, model,modelParameters={}) {
    try {
      
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error('A variável de ambiente OPENAI_API_KEY não está definida.');
      }

      // Endpoint da API
      const endpoint = 'https://api.openai.com/v1/chat/completions';

      // Mensagens de entrada
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ];

      // Se uma URL de imagem for fornecida, adiciona ao conteúdo
      if (modelParameters.imageUrl) {
        messages[0].content.push({
          type: 'image_url',
          image_url: {
            url: modelParameters.imageUrl,
          },
        });
      }

      // Corpo da solicitação
      const payload = {
        model: model,
        messages: messages,
        max_tokens: modelParameters.max_tokens || 4096,
      };

      console.log(`Enviando solicitação para ${endpoint}...`);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      // Chamada à API
      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });      
      
      
      /*const response = await axios.post(
        'https://api.openai.com/v1/chat/completions', // Endpoint da API
        JSON.stringify({
              "model": model, // Modelo ChatGPT
              "messages": [
                {
                  "role": "system", 
                  "content": "Você é um assistente útil."
                },
                {
                  "role": "user", 
                  "content": prompt
                }
              ],
              "max_tokens": 4096
            }),
        {'headers': {
          'Authorization': `Bearer `+ process.env.OPENAI_API_KEY,
          'Content-type': 'application/json'
        }}
      );*/

      if (response.status === 200) {
        return extrairJSON(response.data.choices[0].message.content.trim());
      } else {
        throw new Error(`Erro ao processar com Gemini: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com Gemini:', error);
      throw error;
    }
  }
};

function extrairJSON(resposta) {
    // Exibir a resposta completa para debug
    console.log('resposta gerada...');
    console.log(resposta);

    // Definir o padrão regex para capturar o conteúdo entre ```json e ```
    const regex = /```json\s*([\s\S]*?)\s*```/;
    const match = resposta.match(regex);

    if (match && match[1]) {
        try {
            // Converte a string JSON capturada para um objeto JavaScript
            const jsonString = match[1].trim(); // Remove espaços em branco extras
            console.log('teste');
            console.log(jsonString);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Erro ao fazer o parse do JSON:', error);
            return null;
        }
    } else {
        try {
          return JSON.parse(resposta);
        } catch (error){
          return resposta;
        }
    }
}