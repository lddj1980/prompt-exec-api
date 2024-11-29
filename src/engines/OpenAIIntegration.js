const axios = require('axios');

module.exports = {
  async process(prompt, model) {
    try {
      const response = await axios.post('https://api.openai.com/v1/completions', {
        prompt,
        model,
        max_tokens: 100,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Erro ao processar com OpenAI: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na integração com OpenAI:', error);
      throw error;
    }
  },
};