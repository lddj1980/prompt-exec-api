class TableCleanerService {
    constructor(repository) {
        this.repository = repository;
    }

    async cleanTables() {
        try {
            console.log('Iniciando processo de limpeza das tabelas...');
            // Desabilitar constraints
            await this.repository.executeQuery('SET FOREIGN_KEY_CHECKS = 0');

            // Truncar as tabelas
            await this.repository.executeQuery('TRUNCATE TABLE parametros');
            await this.repository.executeQuery('TRUNCATE TABLE prompts');
            await this.repository.executeQuery('TRUNCATE TABLE prompts_resultados');
            await this.repository.executeQuery('TRUNCATE TABLE solicitacoes_base');
            console.log('Tabelas limpas com sucesso.');

            // Reabilitar constraints
            await this.repository.executeQuery('SET FOREIGN_KEY_CHECKS = 1');
            console.log('Constraints reabilitadas.');
        } catch (error) {
            console.error('Erro ao limpar tabelas:', error);
            throw error;
        }
    }
}

module.exports = TableCleanerService;