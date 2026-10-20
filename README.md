# 🎥 Captura

> **Transforme sua tela em uma boa história.**  
> Grave sua tela diretamente do navegador com máxima privacidade, zero instalações, zero cadastros e sem marcas d'água.

[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)
[![Zero Dependências](https://img.shields.io/badge/depend%C3%AAncias-0-brightgreen.svg)]()
[![Privacidade](https://img.shields.io/badge/privacidade-100%25%20local-success.svg)]()
[![Compatibilidade](https://img.shields.io/badge/navegadores-Chrome%20%7C%20Edge%20%7C%20Firefox-orange.svg)]()

---

## 🌟 O que é o Captura?

O **Captura** é um gravador de tela web minimalista, elegante e focado em privacidade. Ele permite capturar sua tela inteira, uma janela de aplicativo ou uma aba específica do navegador, com áudio do sistema e narração por microfone — tudo processado **100% no seu próprio dispositivo (client-side)**.

Enquanto muitas soluções do mercado exigem contas obrigatórias, enviam seus vídeos para servidores de terceiros ou impõem limites rígidos de tempo em planos gratuitos, o Captura adota uma filosofia simples: **seus dados e vídeos pertencem unicamente a você**.

---

## ⚡ Principais Recursos

- 🔒 **100% Privado e Local:** Nenhum byte de vídeo é enviado para a nuvem. O processamento acontece diretamente na memória do navegador.
- 🚀 **Zero Instalações:** Sem extensões pesadas ou executáveis de terceiros. Basta abrir a página e gravar.
- 🎙️ **Áudio Flexível:**
  - Áudio interno do sistema (som da aba, vídeo ou aplicativo).
  - Narração em tempo real via microfone.
  - Mixagem de ambas as faixas.
- 🎚️ **Controle de Resolução e Bitrate:**
  - **Padrão (720p):** Ideal para envios rápidos e menor consumo de espaço (~2.5 Mbps).
  - **Alta (até 1080p):** Equilíbrio perfeito entre qualidade e tamanho (~5.0 Mbps).
  - **Máxima (Original):** Fidelidade total à resolução da sua tela (~8.0 Mbps).
- ⏸️ **Pausa e Retomada:** Controle total da sua gravação a qualquer momento, com compensação automática de tempo no cronômetro.
- 💾 **Exportação Imediata:** Download instantâneo com estimativa do tamanho final gerado (WebM/MP4 dependendo do navegador).
- 🎨 **Interface Studio Premium:** Design refinado, feedback em tempo real e visual limpo projetado para evitar distrações.

---

## 📊 Por que escolher o Captura?

| Funcionalidade | Captura | Gravadores em Nuvem (Loom, etc.) | Softwares Locais (OBS) |
| :--- | :---: | :---: | :---: |
| **Instalação prévia** | ❌ Não requer | ⚠️ Requer extensão/app | ⚠️ Requer instalação pesada |
| **Necessita login / conta** | ❌ Não | ⚠️ Obrigatório | ❌ Não |
| **Privacidade** | 🛡️ 100% no dispositivo | ☁️ Servidores de terceiros | 🛡️ 100% no dispositivo |
| **Limite de duração** | ♾️ Sem limites | ⏱️ 5 min (plano gratuito) | ♾️ Sem limites |
| **Marcas d'água** | ❌ Nenhuma | ⚠️ Frequente | ❌ Nenhuma |
| **Curva de aprendizado** | 🟢 1 clique | 🟢 Fácil | 🔴 Configurações complexas |

---

## 🚀 Como Funciona (Passo a Passo)

```
[ 1. Iniciar ] ──▶ [ 2. Gravar & Pausar ] ──▶ [ 3. Baixar ]
   Selecione tela       Monitore tempo e        Arquivo pronto
   e áudio desejado     status ao vivo          no seu computador
```

1. **Configure:** Escolha o nível de qualidade e habilite/desabilite áudio do sistema ou microfone no painel de configurações.
2. **Inicie:** Clique em **"Começar a gravar"** e selecione no prompt nativo do navegador a tela inteira, janela ou aba desejada.
3. **Controle:** Use os botões de pausar e retomar conforme necessário. O cronômetro acompanha a gravação em tempo real.
4. **Finalize & Baixe:** Ao terminar, clique em **"Finalizar"** (ou interrompa o compartilhamento nativo) e baixe seu arquivo pronto em segundos!

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com foco em **performance extrema, zero dependências e código limpo**:

- **HTML5 Semântico:** Estrutura acessível com suporte a leitores de tela e navegação por teclado.
- **CSS3 Moderno:** Custom properties (variáveis CSS), Grid, Flexbox e design responsivo adaptável a smartphones e desktops.
- **JavaScript Vanilla (ES6+):**
  - [`Screen Capture API`](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API) (`navigator.mediaDevices.getDisplayMedia`)
  - [`MediaStream Recording API`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API) (`MediaRecorder`)
  - [`Blob & Object URLs`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) para geração de download imediato.

---

## 💻 Como Rodar o Projeto Localmente

Como o projeto é estático e não utiliza bibliotecas externas, você pode executá-lo em poucos segundos:

### Opção 1: Clonar e abrir diretamente
```bash
# Clone o repositório
git clone https://github.com/thiagofal1/captura.git

# Acesse a pasta
cd captura

# Abra o index.html no seu navegador favorito
# No Windows:
start index.html

# No macOS:
open index.html

# No Linux:
xdg-open index.html
```

### Opção 2: Servidor estático leve (Recomendado)
Alguns recursos de permissões de mídia funcionam melhor quando servidos via protocolo `http://` ou `https://`:

```bash
# Usando Python 3
python -m http.server 3000

# Ou usando Node.js (npx)
npx serve .

# Ou com a extensão "Live Server" do VS Code
```

Em seguida, acesse no navegador: `http://localhost:3000`.

---

## 🌐 Compatibilidade de Navegadores

| Navegador | Captura de Tela | Captura de Áudio do Sistema | Microfone |
| :--- | :---: | :---: | :---: |
| **Google Chrome** | ✅ Suportado | ✅ Suportado | ✅ Suportado |
| **Microsoft Edge** | ✅ Suportado | ✅ Suportado | ✅ Suportado |
| **Mozilla Firefox** | ✅ Suportado | ⚠️ Limitado pelo SO | ✅ Suportado |
| **Opera / Brave** | ✅ Suportado | ✅ Suportado | ✅ Suportado |
| **Apple Safari (macOS)** | ✅ Suportado (v13+) | ⚠️ Restrito no macOS | ✅ Suportado |

> 💡 **Nota sobre áudio:** A captura de áudio do sistema operacional depende de permissões do sistema (Windows, macOS ou Linux) e da janela do navegador ("Compartilhar áudio da guia/sistema").

---

## 💡 Próximos Passos & Ideias

Quer ver o que estamos planejando para o futuro do Captura?  
Confira o nosso arquivo [**ideas.md**](ideas.md) com a lista de melhorias prioritárias, recursos visuais (câmera PiP, exportação GIF, anotações na tela) e o roadmap de evolução da ferramenta.

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Se você tem uma ideia de melhoria ou correção:

1. Faça um **Fork** do projeto.
2. Crie uma branch para sua funcionalidade: `git checkout -b feature/minha-melhoria`.
3. Commit suas alterações: `git commit -m 'feat: adiciona nova funcionalidade'`.
4. Envie para o GitHub: `git push origin feature/minha-melhoria`.
5. Abra um **Pull Request**.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para obter mais detalhes.

---

<p align="center">
  Desenvolvido com carinho para simplificar o compartilhamento de ideias. ✨
</p>
