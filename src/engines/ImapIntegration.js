const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");

module.exports = {
  async process(prompt, model, modelParameters = {}) {
    const {
      user,
      password,
      host,
      port,
      tls,
      responseKey,
      searchCriteria = {seen: true}, // Critério padrão ajustado
      fetchOptions = { envelope: true, source: true }, // Opções de busca ajustadas
    } = modelParameters;

    try {
      console.log("Iniciando integração com o servidor IMAP...");

      if (!user || !password || !host || !port || !responseKey) {
        throw new Error(
          'Os parâmetros "user", "password", "host", "port" e "responseKey" são obrigatórios.'
        );
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

      var messages = [];

      // Conecta ao servidor IMAP
      await client.connect();
      console.log("Conexão com o servidor IMAP estabelecida.");

      // Trava a caixa de entrada para garantir consistência
      let lock = await client.getMailboxLock("INBOX");
      try {
        console.log("Caixa de entrada aberta.");

        // Busca mensagens usando os critérios especificados
        const emailIds = await client.search(searchCriteria);
        console.log(`Mensagens encontradas: ${emailIds.length}`);

        if (emailIds.length === 0) {
          console.log("Nenhuma mensagem encontrada com os critérios fornecidos.");
          return {
            [responseKey]: {
              success: true,
              messages: [],
            },
          };
        }

        // Busca o conteúdo das mensagens
        for await (let message of client.fetch(emailIds, fetchOptions)) {
          try {
            // Usa o simpleParser para processar o conteúdo da mensagem
            const mail = await simpleParser(message.source);
            console,log
            messages.push({
              id: message.uid,
              from: mail.from?.text || "Sem remetente",
              subject: mail.subject || "Sem assunto",
              text: mail.text || "",
              date: mail.date || "Sem data",
            });
          } catch (parseError) {
            console.error("Erro ao analisar o email:", parseError);
          }
        }

        console.log("Busca de emails concluída.");
      } finally {
        lock.release();
      }

      // Encerra a conexão com o servidor
      await client.logout();

      console.log("Conexão com o servidor encerrada.");

      // Retorna as mensagens em formato JSON
      return {
        [responseKey]: {
          success: true,
          messages,
        },
      };
    } catch (error) {
      console.error("Erro ao integrar com o servidor IMAP:", error);

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
