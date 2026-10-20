# 💡 Ideias & Roadmap de Evolução — Captura

Este documento reúne análises, melhorias técnicas, novos recursos e estratégias de produto projetadas para transformar o **Captura** em uma ferramenta referência no ecossistema open-source e pronta para um lançamento de alto impacto em plataformas como **Product Hunt, GitHub Trending, Twitter/X, Reddit e TabNews**.

---

## 🎯 Visão do Produto

> **A alternativa aberta, rápida e privada ao Loom, Cleanshot e Vidyard.**  
> Sem pagar assinaturas, sem criar contas, sem limites de 5 minutos e sem enviar dados sigilosos para a nuvem de terceiros.

---

## 🗺️ Matriz de Priorização (Esforço vs. Impacto)

```
        ALTO IMPACTO
             │
   [Q1]      │      [Q2]
   Quick     │     Grandes
   Wins      │    Diferenciais
─────────────┼──────────────── ALTO ESFORÇO
   [Q3]      │      [Q4]
   Polimento │   Secundários /
   Geral     │     Futuros
             │
        BAIXO IMPACTO
```

- **Q1 (Quick Wins - Fazer Primeiro):** Contagem regressiva (3..2..1), Medidor de microfone (VU Meter), Correção de duração WebM, Atalhos de teclado.
- **Q2 (Grandes Diferenciais - O que faz o app viralizar):** Webcam flutuante (Facecam PiP), Exportação em GIF para devs, Moldura estética com fundo gradiente (estilo Screen Studio), Corte pós-gravação (Trim).
- **Q3 (Polimento Geral):** Modo Escuro, Histórico local de gravações (IndexedDB), Seleção de microfone específico.
- **Q4 (Longo Prazo):** PWA offline com auto-update, Transcrição local por IA (Whisper WebGPU), Anotações na tela.

---

## 🚀 1. Melhorias Essenciais de Confiabilidade & UX (Quick Wins)

Melhorias de implementação rápida que eliminam atritos clássicos de gravação no navegador:

### 1.1 Contagem Regressiva Antes de Começar (3, 2, 1... Ação!)
- **Problema atual:** Ao selecionar a tela no diálogo do navegador, a gravação inicia imediatamente. O usuário precisa alternar correndo de janela, gerando segundos iniciais inúteis.
- **Solução:** Exibir um overlay animado central na tela com contagem de 3 segundos com efeito sonoro sutil (opcional) antes de acionar o `recorder.start()`.

### 1.2 Medidor de Nível de Microfone em Tempo Real (VU Meter)
- **Problema atual:** O usuário grava uma apresentação inteira de 10 minutos para só depois descobrir que o microfone estava mudo ou desconectado.
- **Solução:** Adicionar uma barra de volume animada ou indicador de áudio ao vivo sob o toggle de microfone usando `AudioContext` e `AnalyserNode`. O usuário tem certeza imediata de que sua voz está sendo captada.

### 1.3 Mixagem Robusta de Áudio via Web Audio API
- **Problema atual:** No código atual, `recordingStream` agrupa as tracks de áudio do sistema e do microfone em uma lista. Em alguns navegadores/sistemas operacionais, múltiplas tracks de áudio no `MediaStream` podem ignorar uma das faixas ou colocá-las em canais estéreo separados.
- **Solução:** Usar a **Web Audio API** para somar os dois streams em uma única track de áudio mixada cristalina:
  ```javascript
  const audioContext = new AudioContext();
  const dest = audioContext.createMediaStreamDestination();
  if (micTrack) audioContext.createMediaStreamSource(micStream).connect(dest);
  if (sysTrack) audioContext.createMediaStreamSource(sysStream).connect(dest);
  const mixedTrack = dest.stream.getAudioTracks()[0];
  ```

### 1.4 Correção dos Metadados de Duração do WebM
- **Problema clássico:** Vídeos gerados via `MediaRecorder` em formato WebM no Chrome/Edge vêm sem metadados de duração no cabeçalho EBML. Ao abrir o arquivo no reprodutor de mídia do Windows ou VLC, a barra de progresso não funciona (aparece como stream infinito ou 00:00).
- **Solução:** Injetar a duração calculada no cabeçalho do Blob WebM usando uma rotina leve em JavaScript puro (`fix-webm-duration`). O vídeo baixa 100% navegável com scrubber perfeito.

### 1.5 Atalhos de Teclado Globais
- Permitir operar o gravador com atalhos intuitivos:
  - `Espaço` ou `Alt + R`: Iniciar / Parar gravação
  - `Alt + P`: Pausar / Retomar
  - `Esc`: Cancelar / Fechar prévia

---

## 🌟 2. Funcionalidades "Uau" para Divulgação (Showstopper Features)

Recursos que chamam atenção em vídeos curtos, posts de redes sociais e fóruns de tecnologia:

### 2.1 Câmera Flutuante do Apresentador (Webcam / Facecam)
- Uma bolinha de câmera redonda sobreposta na prévia ou no canto da tela.
- Opção de escolher o formato: Círculo elegante com borda, Quadrado arredondado ou Tela cheia.
- Efeito espelho (flip horizontal) para visual mais natural.
- Isso coloca o Captura em paridade direta com o **Loom** e ferramentas pagas.

### 2.2 Exportador de GIF Otimizado (O Queridinho dos Desenvolvedores)
- Criar vídeos de 5 a 15 segundos convertidos diretamente para `.gif` otimizado no navegador.
- **Público-alvo:** Devs criando Pull Requests no GitHub, abrindo issues, documentando animações CSS ou compartilhando bugs em canais de Slack/Discord.
- Opções simples: 15 FPS, 24 FPS, largura de 600px/800px.

### 2.3 Estúdio de Apresentação (Estilo "Screen Studio" / "Raycast")
- Ao exportar o vídeo, permitir envolver a gravação em:
  - Fundo com gradiente suave (Mesh gradient, roxo, azul, escuro, etc.).
  - Cantos arredondados na tela gravada com sombra 3D projetada (drop-shadow).
  - Preenchimento (padding) configurável (ideal para exportar no formato 16:9 para YouTube ou 1:1 para LinkedIn/Twitter).
- **Por que isso vende?** Transforma qualquer tutorial comum de tela em um vídeo com estética profissional de alta produção sem precisar abrir After Effects ou Premiere.

### 2.4 Editor Rápido Pós-Gravação (Trim / Corte de Início e Fim)
- Player com barra de corte simples contendo duas alças (início e fim).
- Permite remover os primeiros segundos de hesitação e os últimos segundos procurando o botão de parar.
- Processamento rápido no navegador sem recodificação demorada.

### 2.5 Realce do Cursor do Mouse (Mouse Click Effect)
- Ondas visuais coloridas ao clicar (efeito clique sonoro ou círculo pulsante).
- Facilita o acompanhamento em tutoriais e demonstrações de software.

---

## 🎨 3. Design & Experiência do Usuário (Design Polish)

### 3.1 Modo Escuro (Dark Mode)
- O design atual claro é super elegante, mas um tema escuro (Dark Canvas) atrai o público técnico e desenvolvedores que trabalham à noite.
- Alternância manual com botão no topo e respeito ao `prefers-color-scheme`.

### 3.2 Histórico Local de Gravações Recentes (Galeria Local)
- Salvar as últimas gravações temporariamente no navegador usando **IndexedDB**.
- Se o usuário fechar a aba por engano após gravar, ele não perde o arquivo.
- Aba "Gravações Recentes" com botão de download, reprodução e exclusão.
- Aviso claro de privacidade: *"Armazenado apenas na memória do seu navegador local"*.

### 3.3 Seletor de Dispositivos de Áudio e Vídeo
- Listar todos os microfones e webcams disponíveis em um `<select>` nativo com permissão já concedida.
- Útil para quem usa microfone USB (Blue Yeti, Shure, fone Bluetooth) e quer garantir a entrada correta.

### 3.4 PWA (Progressive Web App)
- Adicionar `manifest.json` e um `Service Worker`.
- O Captura poderá ser instalado como aplicativo nativo no Windows, macOS ou Linux diretamente pelo Chrome/Edge.
- Funciona 100% offline — você pode gravar sua tela até em um avião sem sinal de internet.

---

## 🧠 4. Ideias de Longo Prazo / Inteligência Artificial Local

### 4.1 Transcrição de Legendas Local com Whisper (WebGPU)
- Usando modelos leves do Whisper compilados para WebAssembly/WebGPU (via `@xenova/transformers`).
- Gera arquivo `.srt` de legendas ou transcrição em texto da fala sem enviar nenhum áudio para a nuvem.
- Um dos maiores diferenciais possíveis para um gravador web gratuito.

### 4.2 Mascaramento de Áreas Sensíveis (Blur / Desfoque)
- Opção de desenhar um retângulo de desfoque sobre senhas, tokens ou dados pessoais antes de gravar uma aba.

---

## 📢 5. Guia Prático para Divulgação & Go-To-Market

Para que o projeto ganhe tração, visibilidade e estrelas no GitHub, recomendo a seguinte ordem de divulgação:

### Etapa 1: Preparação do Terreno (Antes de Postar)
- [ ] Adicionar um GIF ou vídeo de 15 segundos no início do README mostrando o fluxo do app funcionando.
- [ ] Fazer deploy do projeto no **GitHub Pages**, **Vercel** ou **Cloudflare Pages** (com domínio personalizado se possível, ex: `captura.dev` ou `usecaptura.app`).
- [ ] Adicionar um botão discreto de "⭐ Deixe uma estrela no GitHub" no rodapé da aplicação.

### Etapa 2: Onde Publicar

#### 1. TabNews (Comunidade Tech BR)
- **Título sugerido:** *"Criei um gravador de tela 100% no navegador, sem limite de tempo e sem enviar nada pra nuvem (Open Source)"*
- **Foco do post:** Explicar a dor (Loom pago / OBS pesado), o desafio de mexer com `MediaStream` e `MediaRecorder` nativos, e convidar a galera para testar e contribuir.

#### 2. Twitter / X & LinkedIn
- Postar um vídeo curto de 20 segundos gravando a própria tela com o Captura.
- **Hook do tweet:** *"Cansado de pagar por gravadores de tela que cobram US$ 15/mês e enviam seus vídeos para servidores alheios? Apresento o Captura: 0 instalações, 100% privado, no seu navegador."*

#### 3. Reddit (`r/webdev`, `r/opensource`, `r/software`)
- Título: *"I built a lightweight, privacy-focused browser screen recorder with zero dependencies and no cloud uploads."*

#### 4. Product Hunt & Hacker News (Show HN)
- Lançar após implementar os Quick Wins (contagem regressiva e WebM fix).
- Tagline: *"A clean, privacy-first screen recorder that lives in your browser."*

---

## 🏁 Próxima Ação Recomendada

1. Implementar a **contagem regressiva (3..2..1)** e o **VU meter do microfone** (esforço baixo, impacto gigante).
2. Hospedar no GitHub Pages para ter um link demonstrativo público direto no topo do `README.md`.
3. Adicionar uma captura de tela real ou animação no README.

