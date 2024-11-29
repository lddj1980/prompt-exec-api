const axios = require('axios');

module.exports = {
  async process(prompt, model) {
    try {
      const response = await axios.post('https://api.gemini.com/v1/process', {
        prompt,
        model,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
        },
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Erro ao processar com Gemini: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com Gemini:', error);
      throw error;
    }
  },
};