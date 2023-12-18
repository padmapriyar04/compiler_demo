const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const { exec } = require('child_process');
const { PythonShell } = require('python-shell');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/code', async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Invalid request format, both title and body are required' });
    }

    const randomName = crypto.randomBytes(4).toString('hex');
    const filePath = path.join(__dirname, 'files', `${randomName}.${title}`);

    await fs.writeFile(filePath, body);

    console.log('File created');

    // Check if the file has a .js extension
    const fileExtension = path.extname(filePath);
    if (fileExtension === '.js') {
      const jsExecutable = `"node" "${filePath}"`;
      exec(jsExecutable, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Node.js script: ${error.message}`);
          console.error(`Standard Error (stderr): ${stderr}`);
          return res.status(500).json({ error: `${stderr}` });
        }

        return res.json({ 'Standard Output': `${stdout}` });
      });
    }
    else if (fileExtension === '.py') {
      const options = {
        scriptPath: path.join(__dirname, 'files'),
      };

      const pythonRunPromise = () => {
        return new Promise((resolve, reject) => {
          PythonShell.run(`${randomName}.${title}`, options, (err, messages) => {
            if (err) {
              console.error(`Error executing Python script: ${err.message}`);
              reject(err);
            } else {
              // Process messages as needed
              const output = messages.map((msg) => msg.toString()).join('');
              resolve(output);
            }
          });
        });
      };

      // Execute the Python script asynchronously
      const pythonOutput = await pythonRunPromise();
      return res.status(200).json({ output: pythonOutput });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});



