const express = require('express');
const SolicitacaoController = require('../controllers/SolicitacaoController');
const ApiKeyMiddleware = require('../middlewares/ApiKeyMiddleware');

const router = express.Router();

router.post('/solicitacoes', ApiKeyMiddleware, SolicitacaoController.create);
router.post('/solicitacoes/:protocoloUid/resume', ApiKeyMiddleware, SolicitacaoController.resume);
router.get('/solicitacoes/:protocoloUid/progresso', ApiKeyMiddleware, SolicitacaoController.getProgress);
router.get('/solicitacoes/:protocoloUid/resultado', ApiKeyMiddleware, SolicitacaoController.getResultado);

module.exports = router;
