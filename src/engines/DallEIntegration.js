const axios = require('axios');

module.exports = {
  async process(prompt, model,modelParameters={}) {
    try {
      const response = await axios.post('https://api.dall-e.com/v1/images/generate', {
        prompt,
        model,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.DALLE_API_KEY}`,
        },
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Erro ao processar com DALL-E: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com DALL-E:', error);
      throw error;
    }
  },
};
