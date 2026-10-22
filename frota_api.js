const express = require('express');
const app = express();


app.use(express.json());


const PORT = process.env.PORT || 3000;


let veiculos = [];
let proximoId = 1;


app.get('/api/v1/health', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    uptime_segundos: Number(process.uptime().toFixed(2)),
    memoria: {
      rss_mb: +(mem.rss / 1024 / 1024).toFixed(2),
      heapTotal_mb: +(mem.heapTotal / 1024 / 1024).toFixed(2),
      heapUsed_mb: +(mem.heapUsed / 1024 / 1024).toFixed(2)
    },
    timestamp: new Date().toISOString()
  });
});


app.get('/api/v1/veiculos', (req, res) => {
  res.json(veiculos);
});


app.get('/api/v1/veiculos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const veiculo = veiculos.find(v => v.id === id);
  if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado' });
  res.json(veiculo);
});


app.post('/api/v1/veiculos', (req, res) => {
  const { placa, modelo, ano, status } = req.body;
  if (!placa || !modelo) {
    return res.status(400).json({ erro: 'Campos "placa" e "modelo" são obrigatórios' });
  }
  const novo = {
    id: proximoId++,
    placa,
    modelo,
    ano: ano || null,
    status: status || 'disponivel'
  };
  veiculos.push(novo);
  res.status(201).json(novo);
});


app.put('/api/v1/veiculos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = veiculos.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ erro: 'Veículo não encontrado' });


  const { placa, modelo, ano, status } = req.body;
  if (!placa || !modelo) {
    return res.status(400).json({ erro: 'PUT exige "placa" e "modelo"' });
  }
  veiculos[idx] = { id, placa, modelo, ano: ano || null, status: status || 'disponivel' };
  res.json(veiculos[idx]);
});


app.patch('/api/v1/veiculos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const veiculo = veiculos.find(v => v.id === id);
  if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado' });


  const { id: _ignorado, ...campos } = req.body;
  Object.assign(veiculo, campos);
  res.json(veiculo);
});


app.delete('/api/v1/veiculos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = veiculos.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ erro: 'Veículo não encontrado' });


  const [removido] = veiculos.splice(idx, 1);
  res.json({ mensagem: 'Veículo removido', veiculo: removido });
});


app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});


const server = app.listen(PORT, () => {
console.log('API de Frotas rodando na porta ' + PORT);
});


server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
console.error('Porta ' + PORT + ' ja esta em uso. Tente: PORT=' + (Number(PORT) + 1) + ' node frota_api.js');
    process.exit(1);
  }
  throw err;
});
