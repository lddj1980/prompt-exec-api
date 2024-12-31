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

        const messages = await client.fetchAll(emailIds, {source: true});
        for (let message of messages){
          try {
            console.log(message);
            messages.push({
              id: message.uid,
              from: message.from?.text || "Sem remetente",
              subject: message.subject || "Sem assunto",
              text: message.text || "",
              date: message.date || "Sem data",
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
