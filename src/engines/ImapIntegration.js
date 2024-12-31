const { ImapFlow } = require('imapflow');
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
      searchCriteria = { seen: true },
      fetchOptions = { uid: true },
    } = modelParameters;

    try {
      console.log('Iniciando integração com o servidor IMAP...');

      if (!user || !password || !host || !port || !responseKey) {
        throw new Error('Os parâmetros "user", "password", "host", "port" e "responseKey" são obrigatórios.');
      }

      // Configuração do cliente IMAP
      const client = new ImapFlow({
        host,
        port,
        secure: tls !== undefined ? tls : true,
        auth: {
          user,
          pass: password,
        },
      });

      const messages = [];

      // Conecta ao servidor IMAP
      await client.connect();
      console.log('Conexão com o servidor IMAP estabelecida.');

      // Trava a caixa de entrada para garantir consistência
      let lock = await client.getMailboxLock('INBOX');
      try {
        console.log('Caixa de entrada aberta.');

        // Busca mensagens usando os critérios especificados
        const emailIds = await client.search(searchCriteria);
        console.log(`Mensagens encontradas: ${emailIds.length}`);

        if (emailIds.length === 0) {
          console.log('Nenhuma mensagem encontrada com os critérios fornecidos.');
          return {
            [responseKey]: {
              success: true,
              messages: [],
            },
          };
        }

        // Busca o conteúdo das mensagens
        for await (let message of client.fetch(emailIds, { envelope: true, source: true })) {
          const mail = await simpleParser(message.source);
          messages.push({
            from: mail.from.text,
            subject: mail.subject,
            text: mail.text,
            date: mail.date,
          });
        }

        console.log('Busca de emails concluída.');
      } finally {
        lock.release();
      }

      // Encerra a conexão com o servidor
      await client.logout();

      console.log('Conexão com o servidor encerrada.');

      // Retorna as mensagens em formato JSON
      return {
        [responseKey]: {
          success: true,
          messages,
        },
      };
    } catch (error) {
      console.error('Erro ao integrar com o servidor IMAP:', error);

      // Em caso de erro, retorna um JSON vazio
      return {
        [responseKey]: {
          success: false,
          messages: [],
        },
      };
    }
  },
};