const Imap = require('imap');
const { simpleParser } = require('mailparser');

module.exports = {
  async process(prompt, model, modelParameters = {}) {
    const {
      user,
      password,
      host,
      port,
      tls,
      responseKey,
      tlsOptions,
      searchCriteria = ['UNSEEN'],
      fetchOptions = { bodies: '', markSeen: true },
    } = modelParameters;

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
        tlsOptions,
      };

      const imap = new Imap(imapConfig);

      const messages = [];

      // Conecta ao servidor IMAP e busca mensagens
      await new Promise((resolve, reject) => {
        imap.once('ready', () => {
          imap.openBox('INBOX', false, (err, box) => {
            if (err) {
              reject(err);
              return;
            }

            console.log('Caixa de entrada aberta:', box);

            // Realiza a busca com os critérios especificados
            imap.search(searchCriteria, (err, results) => {
              if (err) {
                reject(err);
                return;
              }

              // Verifica se há mensagens para buscar
              if (results.length === 0) {
                console.log('Nenhuma mensagem encontrada com os critérios fornecidos:', searchCriteria);
                imap.end();
                resolve();
                return;
              }

              // Configuração do fetch
              const fetch = imap.fetch(results, fetchOptions);

              fetch.on('message', (msg) => {
                const mailPromises = [];

                msg.on('body', (stream) => {
                  mailPromises.push(
                    simpleParser(stream).then((mail) => {
                      messages.push({
                        from: mail.from.text,
                        subject: mail.subject,
                        text: mail.text,
                        date: mail.date,
                        body: mail.body
                      });
                    })
                  );
                });

                fetch.once('end', async () => {
                  try {
                    // Aguarda o processamento de todas as mensagens
                    await Promise.all(mailPromises);
                    //console.log('Busca de emails concluída.');
                    imap.end();
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                });
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
