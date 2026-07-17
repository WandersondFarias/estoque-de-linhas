# 🧵 Estoque de Linhas

Aplicativo web simples e visual para controle de estoque de linhas de costura — organizado por **cor** e **tipo** (com cera / sem cera), com alerta automático de estoque baixo.

Feito para rodar direto do navegador, sem instalação, sem back-end e sem necessidade de internet após o primeiro carregamento — ideal para uso no celular, no dia a dia do ateliê.

![Status](https://img.shields.io/badge/status-ativo-brightgreen)
![Licença](https://img.shields.io/badge/licença-MIT-blue)
![HTML5](https://img.shields.io/badge/HTML-5-E34F26)
![CSS3](https://img.shields.io/badge/CSS-3-1572B6)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E)

---

## ✨ Funcionalidades

- **Cadastro de linhas** por nome, cor (color picker) e foto real do rolo/cone
- **Classificação por tipo**: `Com cera` ou `Sem cera`
- **Controle de estoque** com botões de baixa (−) e reposição (+)
- **Alerta de estoque mínimo** configurável por item, com banner destacado quando o estoque cruza o limite
- **Busca** por nome da cor
- **Filtros rápidos**: Todos · Com cera · Sem cera · Estoque baixo
- **Upload de foto** por linha (armazenada localmente, sem envio a servidores)
- **Modo claro / escuro**, com alternância manual pelo ícone no cabeçalho e preferência salva no navegador
- **Exportação em PDF** do estoque atualizado, com um toque, incluindo status de cada linha (OK / Baixo)
- **100% offline**: os dados ficam salvos no próprio navegador (`localStorage`)
- **Instalável no celular**: pode ser adicionado à tela inicial e usado como um app nativo

---

## 📸 Demonstração

O app já vem com 3 linhas de exemplo cadastradas, refletindo um estoque real:

| Linha | Tipo |
|---|---|
| Linha Preta | Com cera |
| Linha Branca | Com cera |
| Linha Crua | Sem cera |

> As fotos de exemplo ficam em [`/images`](./images) e podem ser substituídas pelas suas próprias fotos a qualquer momento, direto pelo formulário do app.

---

## 🌗 Modo claro / escuro

Toque no ícone de sol/lua no canto superior direito do cabeçalho para alternar o tema. A escolha fica salva no navegador (`localStorage`) e é aplicada automaticamente nas próximas visitas — sem piscar a tela clara antes de escurecer.

Se você nunca alternou manualmente, o app respeita a preferência do seu sistema operacional (claro ou escuro).

---

## 📄 Exportar estoque em PDF

Toque no ícone de download (ao lado de "Nova linha") para gerar um PDF atualizado do estoque, contendo:

- Data e hora da geração
- Totais (cores cadastradas, unidades em estoque, itens em alerta)
- Lista de todas as linhas com cor, tipo, quantidade, mínimo e status (`OK` ou `BAIXO`)

O arquivo é baixado direto pelo navegador, com o nome `estoque-de-linhas-AAAA-MM-DD.pdf`. Essa função usa a biblioteca [jsPDF](https://github.com/parallax/jsPDF), incluída localmente em [`vendor/jspdf.umd.min.js`](./vendor/jspdf.umd.min.js) — **não depende de internet**, funciona 100% offline, igual ao resto do app.

---

## 🗂️ Estrutura do projeto

```
estoque-de-linhas/
├── index.html          # Estrutura da página
├── style.css            # Estilo visual (tema "ateliê", claro/escuro)
├── script.js            # Lógica da aplicação (estoque, alertas, filtros, fotos, tema, PDF)
├── vendor/
│   └── jspdf.umd.min.js # Biblioteca de geração de PDF, incluída localmente
├── images/              # Fotos das linhas cadastradas por padrão (fundo removido)
│   ├── linha-preta-encerada.png
│   ├── linha-branca-encerada.png
│   └── linha-crua-sem-cera.png
└── README.md
```

---

## 🚀 Como usar

### Opção 1 — Direto pelo GitHub Pages (recomendado para celular)

1. Faça um fork ou clone deste repositório
2. Vá em **Settings → Pages**
3. Em *Source*, selecione a branch `main` e a pasta `/root`
4. Acesse a URL gerada pelo GitHub (ex: `https://seu-usuario.github.io/estoque-de-linhas/`) pelo navegador do celular
5. No menu do navegador, toque em **"Adicionar à tela inicial"** — o app passa a abrir em tela cheia, como um aplicativo instalado

### Opção 2 — Uso local

1. Baixe ou clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/estoque-de-linhas.git
   ```
2. Abra o arquivo `index.html` diretamente no navegador

Não é necessário nenhum servidor, build ou dependência externa.

---

## 🧠 Como funciona o armazenamento

Todos os dados (linhas cadastradas, quantidades, tipos e fotos) são salvos no `localStorage` do navegador, por item, chave `estoque-linhas-v1`. Isso significa que:

- Os dados **não** são enviados para nenhum servidor
- Os dados **persistem** entre sessões no mesmo navegador/dispositivo
- Ao limpar os dados do navegador, o estoque cadastrado é perdido — recomenda-se cuidado ao usar o modo anônimo/privado

---

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 (variáveis de tema para modo claro/escuro, grid responsivo, sem frameworks)
- JavaScript puro (Vanilla JS)
- [jsPDF](https://github.com/parallax/jsPDF) (incluído localmente em `/vendor`, sem CDN), usado apenas na exportação de PDF
- Google Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces), [Inter](https://fonts.google.com/specimen/Inter), [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)

---

## 🗺️ Possíveis melhorias futuras

- [ ] Exportar/importar estoque em `.json` ou `.csv`
- [ ] Histórico de movimentações (entradas e saídas)
- [ ] Suporte a múltiplos usuários/dispositivos via backend
- [ ] Logotipo/imagem no cabeçalho do PDF exportado

Contribuições são bem-vindas — sinta-se à vontade para abrir uma *issue* ou *pull request*.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](./LICENSE) para mais detalhes.

---

<p align="center">Feito para facilitar o controle de estoque no dia a dia do ateliê 🧵</p>
