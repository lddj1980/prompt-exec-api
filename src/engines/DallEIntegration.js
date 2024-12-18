const axios = require('axios');

module.exports = {
  async process(prompt, model,modelParameters) {
    try {
      
      modelParameter
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt: prompt,
          n: 1,
          model: model,
          size: size,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DALLE_API_KEY}`,
          },
        }
      );

      const imageUrl = response.data.data[0].url;
      
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
