const Imap = require('imap');
const { simpleParser } = require('mailparser');

module.exports = {
  async process(prompt, model, modelParameters = {}) {
    // Verifica e extrai os parâmetros necessários de modelParameters
    const { user, password, host, port, tls, responseKey } = modelParameters;
    try {
      console.log('Iniciando integração com o servidor IMAP...');

      if (!user || !password || !host || !port || !responseKey) {
        throw new Error('Os parâmetros "user", "password", "host", "port" e "responseKey" são obrigatórios.');
      }

      // Configuração do IMAP
      const imapConfig = {
        user,
        password,
        host,
        port,
        tls: tls !== undefined ? tls : true, // Usar TLS por padrão
      };

      const imap = new Imap(imapConfig);

      // Array para armazenar as mensagens
      const messages = [];

      // Conecta ao servidor IMAP
      await new Promise((resolve, reject) => {
        imap.once('ready', () => {
          imap.openBox('INBOX', false, (err, box) => {
            if (err) {
              reject(err);
              return;
            }

            const searchCriteria = ['UNSEEN']; // Busca emails não lidos
            const fetchOptions = { bodies: '', markSeen: true };

            imap.search(searchCriteria, (err, results) => {
              if (err) {
                reject(err);
                return;
              }

              // Verifica se há mensagens para buscar
              if (results.length === 0) {
                console.log('Nenhuma mensagem nova encontrada.');
                imap.end();
                resolve(messages);
                return;
              }

              const fetch = imap.fetch(results, fetchOptions);

              fetch.on('message', (msg) => {
                msg.on('body', (stream) => {
                  simpleParser(stream, (err, mail) => {
                    if (err) {
                      console.error('Erro ao analisar o email:', err);
                      return;
                    }

                    // Adiciona a mensagem ao array
                    messages.push({
                      from: mail.from.text,
                      subject: mail.subject,
                      text: mail.text,
                      date: mail.date,
                    });
                  });
                });
              });

              fetch.once('end', () => {
                console.log('Busca de emails concluída.');
                imap.end();
                resolve(messages);
              });
            });
          });
        });

        imap.once('error', (err) => {
          reject(err);
        });

        imap.connect();
      });

      // Retorna as mensagens em formato JSON, referenciadas pela chave responseKey
      return {
        [responseKey]: {
          success: true,
          messages,
        },
      };
    } catch (error) {
      console.error('Erro ao integrar com o servidor IMAP:', error);

      // Em caso de erro, retorna um JSON vazio referenciado pela chave responseKey
      return {
        [responseKey]: {
          success: false,
          messages: [],
        },
      };
    }
  },
};