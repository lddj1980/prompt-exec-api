const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const qs = require('querystring');

module.exports = {
  /**
   * Processa manualmente um comando CURL e executa usando axios.
   * @param {string} curlCommand - O comando CURL a ser processado.
   * @returns {Promise<object>} - A resposta da requisição executada.
   */
  async process(curlCommand) {
    try {
      console.log('Comando CURL recebido:', curlCommand);

      // Parseia o comando CURL
      const config = parseCurlCommand(curlCommand);
      console.log('Configuração gerada para axios:', config);

      // Executa a requisição com axios
      const response = await axios(config);
      console.log('Resposta da requisição:', response.data);

      return response.data;
    } catch (error) {
      console.error('Erro ao processar o comando CURL:', error.message);
      throw error;
    }
  },
};

/**
 * Função para parsear o comando CURL e gerar uma configuração compatível com axios.
 * @param {string} curlCommand - O comando CURL a ser parseado.
 * @returns {object} - Configuração para axios.
 */
function parseCurlCommand(curlCommand) {
  const config = { headers: {} };
  let formData = null;

  // Extrai o método HTTP (padrão: GET)
  config.method = /-X\s+(\w+)/.test(curlCommand)
    ? curlCommand.match(/-X\s+(\w+)/)[1].toLowerCase()
    : 'get';

  // Extrai a URL
  // Atualiza a regex para capturar URLs com aspas simples ou duplas
  const urlMatch = curlCommand.match(/(?:^|\s)['"]?(https?:\/\/[^\s'"]+)['"]?/);
  if (urlMatch) {
    config.url = urlMatch[1];
  } else {
    throw new Error('URL não encontrada no comando CURL.');
  }

  const headerMatches = curlCommand.match(/-H\s+["']?([^"']+)["']?/g) || [];
  headerMatches.forEach((header) => {
    const cleanHeader = header.replace(/-H\s+/, '').replace(/^['"]|['"]$/g, ''); // Remove aspas extras
    const [key, value] = cleanHeader.split(/:\s*/);
    config.headers[key.trim()] = value.trim();
  });


  // Extrai dados do corpo (--data ou --data-urlencode)
  const dataMatch = curlCommand.match(/--data(?:-urlencode)?\s+['"]?([^'"]+)['"]?/);
  if (dataMatch) {
    if (config.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      config.data = qs.stringify(dataMatch[1]);
    } else {
      config.data = dataMatch[1];
    }
  }

  // Processa upload de arquivos (-F ou --form)
  const formMatches = curlCommand.match(/-F\s+["']?([^"' ]+)["']?/g);
  if (formMatches) {
    formData = new FormData();
    formMatches.forEach((field) => {
      const [key, value] = field.replace('-F ', '').split('=');
      if (value.startsWith('@')) {
        // Adiciona arquivos ao form
        const filePath = value.substring(1);
        formData.append(key, fs.createReadStream(filePath));
      } else {
        formData.append(key, value);
      }
    });
    config.data = formData;
    config.headers = { ...config.headers, ...formData.getHeaders() };
  }

  // Autenticação básica (-u)
  const authMatch = curlCommand.match(/-u\s+([^:]+):([^ ]+)/);
  if (authMatch) {
    config.auth = {
      username: authMatch[1],
      password: authMatch[2],
    };
  }

  // Configuração de redirecionamento (-L)
  if (curlCommand.includes('-L')) config.maxRedirects = 5;

  return config;
}
