import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { swaggerSpec } from '../src/api/docs/swaggerConfig.js';

const caminhoArquivo = fileURLToPath(import.meta.url);
const diretorioAtual = path.dirname(caminhoArquivo);

const diretorioDocs = path.join(diretorioAtual, '..', 'docs');

if (!fs.existsSync(diretorioDocs)) {
  fs.mkdirSync(diretorioDocs, { recursive: true });
}

// Salva o JSON do Swagger
const caminhoSwaggerJson = path.join(diretorioDocs, 'swagger.json');
fs.writeFileSync(caminhoSwaggerJson, JSON.stringify(swaggerSpec, null, 2));

// Gera o arquivo index.html
const conteudoHtml = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="SwaggerUI" />
  <title>SwaggerUI - Raízes do Nordeste</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" crossorigin></script>
<script>
  window.onload = () => {
    window.ui = SwaggerUIBundle({
      url: './swagger.json',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      layout: "StandaloneLayout",
    });
  };
</script>
</body>
</html>`;

const caminhoIndexHtml = path.join(diretorioDocs, 'index.html');
fs.writeFileSync(caminhoIndexHtml, conteudoHtml);

console.log('Swagger UI gerado com sucesso em docs/index.html');
