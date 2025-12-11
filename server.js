const express = require('express');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = 4000; // Puedes cambiarlo si necesitas
const codesFile = path.join(__dirname, 'verification_codes.json');

// Endpoint para generar y guardar un nuevo código
app.post('/api/resend-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'El número de teléfono es obligatorio.' });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = 5;
    const createdAt = new Date().toISOString();

    let codes = [];
    if (await fs.pathExists(codesFile)) {
      codes = await fs.readJson(codesFile);
    }

    // Eliminar registros anteriores de ese mismo número
    codes = codes.filter(c => c.phone !== phone);

    // Agregar el nuevo código
    codes.push({ phone, code: newCode, createdAt, expiresInMinutes });

    await fs.writeJson(codesFile, codes, { spaces: 2 });

    res.json({ success: true, code: newCode, expiresInMinutes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar el código' });
  }
});

// Endpoint para verificar un código
app.post('/api/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Teléfono y código son obligatorios.' });
    }

    if (!(await fs.pathExists(codesFile))) {
      return res.status(400).json({ error: 'No existen códigos generados.' });
    }

    const codes = await fs.readJson(codesFile);
    const record = codes.find(c => c.phone === phone);

    if (!record) {
      return res.status(400).json({ error: 'No se encontró un código para este número.' });
    }

    const createdAt = new Date(record.createdAt);
    const expiresAt = new Date(createdAt.getTime() + record.expiresInMinutes * 60000);

    if (new Date() > expiresAt) {
      return res.status(400).json({ error: 'El código ha expirado.' });
    }

    if (record.code !== code) {
      return res.status(400).json({ error: 'Código incorrecto.' });
    }

    // Si es válido, eliminamos el código para que no se reutilice
    const updatedCodes = codes.filter(c => c.phone !== phone);
    await fs.writeJson(codesFile, updatedCodes, { spaces: 2 });

    res.json({ success: true, message: 'Código verificado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar el código' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de verificación corriendo en http://localhost:${PORT}`);
});