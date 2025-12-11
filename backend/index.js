const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Ruta de prueba principal
app.get('/', (req, res) => {
  res.send('Backend corriendo');
});

// Ruta para enviar código de verificación
app.post('/api/resend-code', (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Falta el número de teléfono' });
  }

  // Aquí generamos un código temporal (simulado)
  const code = Math.floor(1000 + Math.random() * 9000); // Código de 4 dígitos

  // En un backend real, enviarías el código por WhatsApp/SMS aquí

  console.log(`Código para ${phone}: ${code}`);

  return res.json({ success: true, code });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});