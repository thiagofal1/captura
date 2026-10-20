# 🗺️ Roadmap de Desenvolvimento — Captura

Este documento estabelece o cronograma de evolução e marcos técnicos do **Captura**, transformando o MVP atual em uma ferramenta robusta, competitiva e pronta para adoção em larga escala pela comunidade tech.

---

## 📌 Visão dos Marcos (Milestones)

```
[ v1.0 ] ────────▶ [ v1.1 ] ────────▶ [ v1.2 ] ────────▶ [ v1.3 ] ────────▶ [ v2.0 ]
  MVP Atual          Confiabilidade     Lançamento          Estúdio & Pós     IA Local &
  (Navegador)        & Áudio Real       (Facecam & GIF)     (Trim & PWA)      Anotações
```

---

## 🚦 Fases de Entrega

### 🟢 Versão 1.0 — MVP Base *(Concluído)*
Versão inicial estável, 100% no navegador, sem dependências externas.
- [x] Captura de tela inteira, janela ou aba do navegador (`getDisplayMedia`).
- [x] Áudio do sistema e suporte a microfone (`getUserMedia`).
- [x] Controles de gravação: Iniciar, Pausar, Retomar e Finalizar.
- [x] Cronômetro em tempo real com compensação de pausas.
- [x] Seletor de qualidade e bitrate (Padrão 720p, Alta 1080p, Máxima original).
- [x] Painel de download imediato com cálculo do tamanho do arquivo (KB/MB).
- [x] Tratamento de erros de permissão e avisos via Toast.
- [x] Design responsivo com visual Studio limpo.

---

### 🟡 Versão 1.1 — Confiabilidade & Experiência de Gravação *(Prioridade Atual)*
> **Objetivo:** Eliminar atritos comuns de gravação no navegador e garantir arquivos de vídeo 100% compatíveis com qualquer reprodutor.

- [ ] **Contagem Regressiva (3..2..1...):**
  - Overlay animado antes do início real da gravação, dando tempo para o usuário posicionar a janela correta.
- [ ] **Medidor de Volume do Microfone (VU Meter):**
  - Barra animada em tempo real ao lado do toggle de microfone (`AudioContext` + `AnalyserNode`) para evitar gravações no mudo.
- [ ] **Mixagem de Áudio Nativa via Web Audio API:**
  - Fusão real dos streams de áudio do sistema e do microfone em uma única faixa mixada para evitar perda de canais em navegadores específicos.
- [ ] **Correção de Metadados WebM (Scrubber & Duração):**
  - Injeção da duração no cabeçalho EBML do WebM para garantir que a barra de progresso funcione no Windows Media Player, VLC e QuickTime.
- [ ] **Atalhos de Teclado Globais:**
  - `Espaço` ou `Alt + R` (Iniciar/Parar gravação), `Alt + P` (Pausar/Retomar), `Esc` (Cancelar).
- [ ] **Seleção Explícita de Dispositivo de Áudio:**
  - Dropdown com lista dos microfones disponíveis caso o usuário utilize mais de uma entrada (headset, mic USB, etc.).

---

### 🔵 Versão 1.2 — Recursos "Showstopper" & Lançamento Público
> **Objetivo:** Implementar recursos de alto apelo visual para lançamento em redes sociais, fóruns de desenvolvedores e comunidades abertas.

- [ ] **Câmera Flutuante do Apresentador (Facecam PiP):**
  - Câmera em formato circular com borda personalizável sobreposta ao vídeo.
  - Opção de espelhamento (flip horizontal) e ajuste de posição (cantos da tela).
- [ ] **Exportação para GIF Otimizado:**
  - Botão de download rápido em formato `.gif` de alta fluidez (15–24 fps), pensado para Pull Requests, issues do GitHub e chats (Slack/Discord).
- [ ] **Modo Escuro (Dark Mode):**
  - Suporte ao tema escuro nativo com botão toggle e sincronização automática com `prefers-color-scheme`.
- [ ] **Efeito Visual no Clique do Mouse (Click Ripple):**
  - Destaque visual (círculo animado) na posição dos cliques para melhorar vídeos de tutoriais e demonstrações.
- [ ] **Deploy Público Oficial (GitHub Pages):**
  - Publicação da aplicação online com link acessível diretamente no topo do repositório.
- 🚀 **Marco de Divulgação 1:** Post de lançamento no **TabNews**, **Twitter/X** e **LinkedIn**.

---

### 🟣 Versão 1.3 — Estúdio & Pós-Produção Leve
> **Objetivo:** Permitir ao usuário lapidar e estilizar seu conteúdo antes de compartilhar, sem precisar de editores pesados.

- [ ] **Editor de Início e Fim (Trim Tool):**
  - Barra deslizante com mini-player para cortar segundos iniciais ou finais antes do download.
- [ ] **Moldura Estilo "Screen Studio" / Gradiente de Fundo:**
  - Adição opcional de cantos arredondados, sombra 3D projetada e fundo com gradiente estético no vídeo exportado.
- [ ] **Histórico Local de Gravações Recentes (IndexedDB):**
  - Armazenamento temporário das últimas gravações no próprio navegador para proteger contra fechamentos acidentais de aba.
- [ ] **PWA (Progressive Web App):**
  - Instalação no computador como aplicativo nativo e funcionamento 100% offline.
- 🚀 **Marco de Divulgação 2:** Lançamento no **Product Hunt** e **Hacker News (Show HN)**.

---

### 🔮 Versão 2.0 — Inovação & IA no Navegador (Visão Futura)
> **Objetivo:** Adicionar recursos de vanguarda utilizando WebAssembly e WebGPU mantendo a privacidade total (client-side).

- [ ] **Legendas e Transcrição Local com Whisper (WebGPU):**
  - Geração de legendas `.srt` e transcrição em texto da narração sem envio de dados para servidores externos.
- [ ] **Ferramenta de Desenho e Anotações em Tempo Real:**
  - Caneta, setas e caixas desenháveis na tela durante a gravação.
- [ ] **Desfoque de Áreas Sensíveis (Blur Mask):**
  - Seleção de caixas de desfoque sobre senhas, tokens ou dados pessoais antes de gravar.

---

## 📊 Matriz Consolidada de Recursos

| Funcionalidade | Versão Alvo | Esforço | Impacto | Status |
| :--- | :---: | :---: | :---: | :---: |
| Captura de Tela + Áudio Básico | **v1.0** | Baixo | Crítico | 🟢 Concluído |
| Seletor de Qualidade / Bitrate | **v1.0** | Baixo | Alto | 🟢 Concluído |
| Contagem Regressiva (3..2..1) | **v1.1** | Baixo | Alto | 🟡 Planejado |
| VU Meter (Nível do Microfone) | **v1.1** | Médio | Alto | 🟡 Planejado |
| Mixagem via Web Audio API | **v1.1** | Médio | Crítico | 🟡 Planejado |
| Correção de Duração WebM | **v1.1** | Baixo | Alto | 🟡 Planejado |
| Atalhos de Teclado | **v1.1** | Baixo | Médio | 🟡 Planejado |
| Facecam PiP (Bolinha de Câmera) | **v1.2** | Médio | Muito Alto | 🟡 Planejado |
| Exportador de GIF Otimizado | **v1.2** | Médio | Muito Alto | 🟡 Planejado |
| Tema Escuro (Dark Mode) | **v1.2** | Baixo | Médio | 🟡 Planejado |
| Editor Trim (Corte de Bordas) | **v1.3** | Médio | Alto | 🟡 Planejado |
| Moldura Estilo Screen Studio | **v1.3** | Alto | Muito Alto | 🟡 Planejado |
| PWA Offline | **v1.3** | Baixo | Médio | 🟡 Planejado |
| Histórico IndexedDB | **v1.3** | Médio | Médio | 🟡 Planejado |
| Transcrição Whisper Local | **v2.0** | Alto | Muito Alto | 🔮 Futuro |
| Anotações na Tela | **v2.0** | Alto | Alto | 🔮 Futuro |

---

## 💡 Como Acompanhar ou Sugerir Novas Ideias

Quer ver um recurso específico implementado ou tem uma sugestão?
- Consulte o documento detalhado de conceitos em [ideas.md](ideas.md).
- Abra uma [Issue no GitHub](https://github.com/thiagofal1/captura/issues) com a etiqueta `enhancement`.

