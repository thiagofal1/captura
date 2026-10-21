/**
 * Captura Studio — Professional Web Screen Recorder
 * OBS Dark Theme Edition
 * 
 * Features:
 * - Screen & Window Capture (Screen Capture API)
 * - Professional Web Audio API Multi-Track Mixing
 * - Real-time OBS-style VU Meters (-50 dB to 0 dB)
 * - Countdown Overlay before recording (3..2..1)
 * - WebM EBML Duration Header Patching (fix-webm-duration)
 * - Global Keyboard Shortcuts (Space, Alt+R, Alt+P, Esc)
 * - 100% Client-Side Privacy (Zero Cloud Uploads)
 */

(() => {
  'use strict';

  // --- DOM Elements ---
  const previewContainer = document.querySelector('#previewArea');
  const previewVideo = document.querySelector('#previewVideo');
  const recordButton = document.querySelector('#recordButton');
  const pauseButton = document.querySelector('#pauseButton');
  const downloadButton = document.querySelector('#downloadButton');
  const shortcutsBtn = document.querySelector('#shortcutsBtn');
  const menuShortcutsBtn = document.querySelector('#menuShortcutsBtn');
  const menuHelpBtn = document.querySelector('#menuHelpBtn');
  const testMicBtn = document.querySelector('#testMicBtn');
  const menuAudioBtn = document.querySelector('#menuAudioBtn');

  // Overlays & Tags
  const countdownOverlay = document.querySelector('#countdownOverlay');
  const countdownNumber = document.querySelector('#countdownNumber');
  const skipCountdownBtn = document.querySelector('#skipCountdownBtn');
  const liveTag = document.querySelector('#liveTag');
  const timerTag = document.querySelector('#timerTag');
  const streamResolutionLabel = document.querySelector('#streamResolutionLabel');
  const canvasQualityBadge = document.querySelector('#canvasQualityBadge');

  // Status Bar Elements
  const globalStatusDot = document.querySelector('#globalStatusDot');
  const globalStatusText = document.querySelector('#globalStatusText');
  const recStatusMetric = document.querySelector('#recStatusMetric');
  const statusTimerDisplay = document.querySelector('#statusTimerDisplay');
  const statusFpsMetric = document.querySelector('#statusFpsMetric');
  const statusSizeDisplay = document.querySelector('#statusSizeDisplay');

  // Mixer Controls & Meters
  const desktopVuFill = document.querySelector('#desktopVuFill');
  const desktopDbLabel = document.querySelector('#desktopDbLabel');
  const desktopFader = document.querySelector('#desktopFader');
  const desktopMuteBtn = document.querySelector('#desktopMuteBtn');
  const desktopMuteIcon = document.querySelector('#desktopMuteIcon');

  const micVuFill = document.querySelector('#micVuFill');
  const micDbLabel = document.querySelector('#micDbLabel');
  const micFader = document.querySelector('#micFader');
  const micMuteBtn = document.querySelector('#micMuteBtn');
  const micMuteIcon = document.querySelector('#micMuteIcon');

  // Sources Controls
  const toggleScreenBtn = document.querySelector('#toggleScreenBtn');
  const toggleMicBtn = document.querySelector('#toggleMicBtn');
  const toggleSysAudioBtn = document.querySelector('#toggleSysAudioBtn');
  const micEyeIcon = document.querySelector('#micEyeIcon');
  const sysEyeIcon = document.querySelector('#sysEyeIcon');
  const sourceScreenStatus = document.querySelector('#sourceScreenStatus');
  const sourceMicStatus = document.querySelector('#sourceMicStatus');
  const sourceSysAudioStatus = document.querySelector('#sourceSysAudioStatus');

  // Settings
  const qualitySelect = document.querySelector('#qualitySelect');
  const fpsSelect = document.querySelector('#fpsSelect');
  const countdownSelect = document.querySelector('#countdownSelect');
  const sceneItems = document.querySelectorAll('.scene-item');

  // Modals & Toast
  const resultModal = document.querySelector('#resultModal');
  const resultVideoPlayer = document.querySelector('#resultVideoPlayer');
  const resultDurationVal = document.querySelector('#resultDurationVal');
  const resultSizeVal = document.querySelector('#resultSizeVal');
  const resultFormatVal = document.querySelector('#resultFormatVal');
  const modalDownloadBtn = document.querySelector('#modalDownloadBtn');
  const modalNewRecordBtn = document.querySelector('#modalNewRecordBtn');
  const closeResultModal = document.querySelector('#closeResultModal');

  const shortcutsModal = document.querySelector('#shortcutsModal');
  const closeShortcutsModal = document.querySelector('#closeShortcutsModal');
  const dismissShortcutsBtn = document.querySelector('#dismissShortcutsBtn');
  const toast = document.querySelector('#toast');

  // --- Quality & Bitrate Settings ---
  const qualityBitrates = {
    standard: 2_500_000,
    high: 5_000_000,
    maximum: 8_500_000,
  };

  // --- State Variables ---
  let displayStream = null;
  let microphoneStream = null;
  let recorder = null;
  let recordedChunks = [];
  let currentVideoBlob = null;
  let currentVideoUrl = null;

  let timerInterval = null;
  let vuAnimationId = null;
  let startedAt = 0;
  let pausedAt = 0;
  let pausedDuration = 0;
  let countdownTimerId = null;
  let isCountingDown = false;
  let toastTimeout = null;

  // Audio Pipeline State
  let audioContext = null;
  let audioDestination = null;
  let desktopSourceNode = null;
  let desktopGainNode = null;
  let desktopAnalyser = null;
  let micSourceNode = null;
  let micGainNode = null;
  let micAnalyser = null;

  let isDesktopMuted = false;
  let isMicMuted = false;
  let previousDesktopVol = 1.0;
  let previousMicVol = 1.0;

  let isDesktopAudioEnabled = true;
  let isMicAudioEnabled = true;

  // --- Toast Notification Helper ---
  function showToast(message, duration = 4500) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), duration);
  }

  // --- Format Helpers ---
  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0.0 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // --- Status Bar Updates ---
  function updateGlobalStatus(state, label) {
    globalStatusDot.className = 'status-indicator-dot ' + state;
    globalStatusText.textContent = label;

    if (state === 'recording') {
      recStatusMetric.classList.add('active');
      liveTag.hidden = false;
      timerTag.hidden = false;
    } else {
      recStatusMetric.classList.remove('active');
      if (state === 'ready') {
        liveTag.hidden = true;
        timerTag.hidden = true;
      }
    }
  }

  function updateTimer() {
    if (!startedAt) return;
    const currentPause = pausedAt ? Date.now() - pausedAt : 0;
    const elapsed = Date.now() - startedAt - pausedDuration - currentPause;
    const timeFormatted = formatTime(elapsed);
    timerTag.textContent = timeFormatted;
    statusTimerDisplay.textContent = timeFormatted;

    // Estimate file size dynamically
    const bitrate = qualityBitrates[qualitySelect.value] || 5_000_000;
    const estimatedBytes = Math.round((elapsed / 1000) * (bitrate / 8));
    statusSizeDisplay.textContent = formatBytes(estimatedBytes);
  }

  // --- Web Audio API Initialization & VU Metering ---
  function ensureAudioContext() {
    if (!audioContext || audioContext.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  function setupDesktopAudioNodes(track) {
    const ctx = ensureAudioContext();
    if (!audioDestination) {
      audioDestination = ctx.createMediaStreamDestination();
    }

    try {
      const stream = new MediaStream([track]);
      desktopSourceNode = ctx.createMediaStreamSource(stream);
      desktopGainNode = ctx.createGain();
      desktopGainNode.gain.value = isDesktopMuted ? 0 : parseFloat(desktopFader.value);

      desktopAnalyser = ctx.createAnalyser();
      desktopAnalyser.fftSize = 128;
      desktopAnalyser.smoothingTimeConstant = 0.65;

      desktopSourceNode.connect(desktopGainNode);
      desktopGainNode.connect(audioDestination);
      desktopGainNode.connect(desktopAnalyser);
    } catch (err) {
      console.warn('Erro ao conectar áudio do desktop:', err);
    }
  }

  async function initMicrophoneAudio(silent = false) {
    try {
      if (microphoneStream) {
        return microphoneStream;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      microphoneStream = stream;

      const ctx = ensureAudioContext();
      if (!audioDestination) {
        audioDestination = ctx.createMediaStreamDestination();
      }

      micSourceNode = ctx.createMediaStreamSource(microphoneStream);
      micGainNode = ctx.createGain();
      micGainNode.gain.value = isMicMuted ? 0 : parseFloat(micFader.value);

      micAnalyser = ctx.createAnalyser();
      micAnalyser.fftSize = 128;
      micAnalyser.smoothingTimeConstant = 0.65;

      micSourceNode.connect(micGainNode);
      micGainNode.connect(audioDestination);
      micGainNode.connect(micAnalyser);

      sourceMicStatus.textContent = 'Conectado';
      sourceMicStatus.style.color = '#38d39f';
      if (!silent) showToast('Microfone conectado com sucesso!');
      startVuMeterLoop();
      return stream;
    } catch (err) {
      sourceMicStatus.textContent = 'Erro / Negado';
      sourceMicStatus.style.color = '#ff6b6b';
      if (!silent) showToast('Permissão de microfone negada ou indisponível.');
      return null;
    }
  }

  // Calculate dB & Percentage for VU Meter
  function computeLevel(analyser) {
    if (!analyser) return { percent: 0, dbText: '-inf dB' };
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    const rms = Math.sqrt(sum / data.length) / 255;
    if (rms <= 0.005) {
      return { percent: 0, dbText: '-inf dB' };
    }

    const db = 20 * Math.log10(rms);
    const clampedDb = Math.max(-50, Math.min(0, db));
    const percent = Math.min(100, Math.max(0, ((clampedDb + 50) / 50) * 100));
    return {
      percent,
      dbText: `${clampedDb.toFixed(1)} dB`,
    };
  }

  function startVuMeterLoop() {
    if (vuAnimationId) return;

    function renderVu() {
      // Desktop Audio Meter
      if (desktopAnalyser && isDesktopAudioEnabled && !isDesktopMuted) {
        const desktopLevel = computeLevel(desktopAnalyser);
        desktopVuFill.style.width = `${desktopLevel.percent}%`;
        desktopDbLabel.textContent = desktopLevel.dbText;
      } else {
        desktopVuFill.style.width = '0%';
        desktopDbLabel.textContent = '-inf dB';
      }

      // Mic Audio Meter
      if (micAnalyser && isMicAudioEnabled && !isMicMuted) {
        const micLevel = computeLevel(micAnalyser);
        micVuFill.style.width = `${micLevel.percent}%`;
        micDbLabel.textContent = micLevel.dbText;
      } else {
        micVuFill.style.width = '0%';
        micDbLabel.textContent = '-inf dB';
      }

      vuAnimationId = requestAnimationFrame(renderVu);
    }

    vuAnimationId = requestAnimationFrame(renderVu);
  }

  function stopVuMeterLoop() {
    if (vuAnimationId) {
      cancelAnimationFrame(vuAnimationId);
      vuAnimationId = null;
    }
    desktopVuFill.style.width = '0%';
    micVuFill.style.width = '0%';
    desktopDbLabel.textContent = '-inf dB';
    micDbLabel.textContent = '-inf dB';
  }

  // --- Supported Mime Types ---
  function getSupportedMimeType() {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
    return [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ].find((type) => MediaRecorder.isTypeSupported(type)) || '';
  }

  // --- Release Streams & Cleanup ---
  function stopTracks(stream) {
    if (stream && stream.getTracks) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  function cleanupStreams() {
    stopTracks(displayStream);
    stopTracks(microphoneStream);
    displayStream = null;
    microphoneStream = null;

    if (previewVideo) previewVideo.srcObject = null;
    previewContainer.classList.remove('has-stream');

    sourceScreenStatus.textContent = 'Pronto';
    sourceScreenStatus.style.color = '';
    streamResolutionLabel.textContent = 'Fonte: Nenhuma selecionada';
    liveTag.hidden = true;
    timerTag.hidden = true;

    if (desktopSourceNode) {
      try { desktopSourceNode.disconnect(); } catch (e) {}
      desktopSourceNode = null;
    }
    if (micSourceNode) {
      try { micSourceNode.disconnect(); } catch (e) {}
      micSourceNode = null;
    }

    stopVuMeterLoop();
  }

  function resetControls() {
    window.clearInterval(timerInterval);
    timerInterval = null;

    recordButton.classList.remove('is-recording');
    recordButton.disabled = false;
    recordButton.innerHTML = '<span class="btn-rec-dot"></span> Iniciar gravação';

    pauseButton.disabled = true;
    pauseButton.innerHTML = '<span class="pause-icon" aria-hidden="true">Ⅱ</span> Pausar gravação';

    updateGlobalStatus('ready', 'Pronto para gravar');
    statusTimerDisplay.textContent = '00:00:00';
  }

  // --- Countdown Sequence ---
  function startCountdown(seconds, onComplete) {
    if (seconds <= 0) {
      onComplete();
      return;
    }

    isCountingDown = true;
    countdownOverlay.hidden = false;
    let current = seconds;
    countdownNumber.textContent = current;

    countdownTimerId = window.setInterval(() => {
      current--;
      if (current > 0) {
        countdownNumber.textContent = current;
      } else {
        window.clearInterval(countdownTimerId);
        countdownTimerId = null;
        countdownOverlay.hidden = true;
        isCountingDown = false;
        onComplete();
      }
    }, 1000);
  }

  function cancelOrSkipCountdown() {
    if (!isCountingDown) return;
    window.clearInterval(countdownTimerId);
    countdownTimerId = null;
    countdownOverlay.hidden = true;
    isCountingDown = false;
    beginActualRecording();
  }

  // --- Actual Recording Logic ---
  function beginActualRecording() {
    if (!recorder) return;
    try {
      recorder.start(1000);
      startedAt = Date.now();
      pausedAt = 0;
      pausedDuration = 0;

      updateTimer();
      timerInterval = window.setInterval(updateTimer, 300);

      recordButton.classList.add('is-recording');
      recordButton.innerHTML = '<span class="btn-rec-dot"></span> Parar gravação';
      recordButton.disabled = false;
      pauseButton.disabled = false;

      updateGlobalStatus('recording', 'Gravando ao vivo');
      showToast('Gravação iniciada! Use Espaço ou Alt+R para finalizar quando quiser.');
    } catch (err) {
      console.error('Erro ao iniciar MediaRecorder:', err);
      showToast('Falha ao iniciar gravador. Verifique as configurações.');
      resetControls();
      cleanupStreams();
    }
  }

  // --- Start Recording Pipeline ---
  async function initiateRecordingFlow() {
    if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === 'undefined') {
      showToast('Gravação de tela não suportada neste navegador. Utilize o Chrome, Edge ou Firefox.');
      return;
    }

    // If currently recording, this button stops the recording
    if (recorder && recorder.state !== 'inactive') {
      stopRecording();
      return;
    }

    recordButton.disabled = true;
    updateGlobalStatus('ready', 'Aguardando seleção de tela...');

    try {
      const selectedFps = parseInt(fpsSelect.value, 10) || 60;
      
      // 1. Get Screen Capture Stream
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: selectedFps, max: selectedFps },
          cursor: 'always',
        },
        audio: isDesktopAudioEnabled,
        systemAudio: isDesktopAudioEnabled ? 'include' : 'exclude',
      });

      // Show video on Canvas
      previewVideo.srcObject = displayStream;
      previewContainer.classList.add('has-stream');

      // Update resolution label
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const resText = settings.width && settings.height 
          ? `${settings.width}x${settings.height}` 
          : 'Original';
        streamResolutionLabel.textContent = `Fonte: ${resText} @ ${selectedFps}fps`;
        sourceScreenStatus.textContent = `${resText}`;
        sourceScreenStatus.style.color = '#38d39f';

        // Auto-stop if user stops sharing via browser native UI bar
        videoTrack.addEventListener('ended', stopRecording, { once: true });
      }

      // 2. Setup Audio Routing via Web Audio API
      ensureAudioContext();
      audioDestination = audioContext.createMediaStreamDestination();

      // Hook Desktop Audio if present
      const sysAudioTracks = displayStream.getAudioTracks();
      if (sysAudioTracks.length > 0 && isDesktopAudioEnabled) {
        setupDesktopAudioNodes(sysAudioTracks[0]);
        sourceSysAudioStatus.textContent = 'Ativo';
        sourceSysAudioStatus.style.color = '#38d39f';
      } else {
        sourceSysAudioStatus.textContent = 'Sem áudio';
        sourceSysAudioStatus.style.color = '#79829e';
      }

      // Hook Microphone if enabled
      if (isMicAudioEnabled) {
        await initMicrophoneAudio(true);
      }

      startVuMeterLoop();

      // 3. Assemble Mixed Stream
      const outputTracks = [...displayStream.getVideoTracks()];
      const mixedAudioTracks = audioDestination.stream.getAudioTracks();
      if (mixedAudioTracks.length > 0) {
        outputTracks.push(mixedAudioTracks[0]);
      }

      const finalRecordingStream = new MediaStream(outputTracks);

      // 4. Configure MediaRecorder
      const mimeType = getSupportedMimeType();
      const bitrate = qualityBitrates[qualitySelect.value] || 5_000_000;
      const options = { videoBitsPerSecond: bitrate };
      if (mimeType) options.mimeType = mimeType;

      recordedChunks = [];
      recorder = new MediaRecorder(finalRecordingStream, options);

      recorder.addEventListener('dataavailable', (evt) => {
        if (evt.data && evt.data.size > 0) {
          recordedChunks.push(evt.data);
        }
      });

      recorder.addEventListener('stop', handleRecordingFinished, { once: true });
      recorder.addEventListener('error', (err) => {
        console.error('MediaRecorder error:', err);
        showToast('Erro durante a gravação.');
        resetControls();
        cleanupStreams();
      }, { once: true });

      // 5. Trigger Countdown
      const countdownSeconds = parseInt(countdownSelect.value, 10) || 0;
      startCountdown(countdownSeconds, beginActualRecording);

    } catch (err) {
      console.warn('Fluxo de gravação cancelado ou com erro:', err);
      cleanupStreams();
      resetControls();
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        showToast('Compartilhamento de tela cancelado.');
      } else {
        showToast(`Não foi possível iniciar: ${err.message || 'Verifique as permissões'}`);
      }
    }
  }

  // --- Stop Recording ---
  function stopRecording() {
    if (isCountingDown) {
      cancelOrSkipCountdown();
    }
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }

  // --- Pause & Resume ---
  function togglePause() {
    if (!recorder) return;

    if (recorder.state === 'recording') {
      recorder.pause();
      pausedAt = Date.now();
      pauseButton.innerHTML = '<span class="pause-icon" aria-hidden="true">▶</span> Retomar gravação';
      updateGlobalStatus('paused', 'Gravação pausada');
      showToast('Gravação pausada.');
    } else if (recorder.state === 'paused') {
      recorder.resume();
      pausedDuration += Date.now() - pausedAt;
      pausedAt = 0;
      pauseButton.innerHTML = '<span class="pause-icon" aria-hidden="true">Ⅱ</span> Pausar gravação';
      updateGlobalStatus('recording', 'Gravando ao vivo');
      showToast('Gravação retomada.');
    }
  }

  // --- Handle Finished Recording & WebM Fix ---
  async function handleRecordingFinished() {
    const totalDuration = Math.max(1000, Date.now() - startedAt - pausedDuration);
    const mimeType = recorder?.mimeType || 'video/webm';
    const rawBlob = new Blob(recordedChunks, { type: mimeType });
    const isWebm = mimeType.includes('webm');
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';

    resetControls();
    cleanupStreams();

    if (rawBlob.size === 0) {
      showToast('O navegador não gravou dados. Tente novamente.');
      return;
    }

    updateGlobalStatus('ready', 'Finalizando arquivo e metadados...');
    showToast('Processando gravação e aplicando metadados de duração...');

    let finalBlob = rawBlob;

    // WebM EBML Duration Header Patch (via fix-webm-duration)
    if (isWebm && typeof window.ysFixWebmDuration === 'function') {
      try {
        finalBlob = await window.ysFixWebmDuration(rawBlob, totalDuration);
        console.log('Metadados WebM corrigidos com sucesso! Duração:', totalDuration);
      } catch (err) {
        console.warn('Não foi possível injetar metadados EBML, usando blob original:', err);
      }
    }

    currentVideoBlob = finalBlob;
    if (currentVideoUrl) URL.revokeObjectURL(currentVideoUrl);
    currentVideoUrl = URL.createObjectURL(finalBlob);

    // Prepare Result Modal
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = `captura-${dateStamp}-${Math.floor(Math.random() * 8999 + 1000)}.${extension}`;
    
    resultVideoPlayer.src = currentVideoUrl;
    modalDownloadBtn.href = currentVideoUrl;
    modalDownloadBtn.download = fileName;
    
    resultDurationVal.textContent = formatTime(totalDuration);
    resultSizeVal.textContent = formatBytes(finalBlob.size);
    resultFormatVal.textContent = `${extension.toUpperCase()} · ${isWebm ? 'EBML Corrigido' : 'Padrão'}`;

    // Enable dock download button
    downloadButton.disabled = false;
    downloadButton.onclick = () => {
      const a = document.createElement('a');
      a.href = currentVideoUrl;
      a.download = fileName;
      a.click();
    };

    // Show Dialog
    resultModal.hidden = false;
    updateGlobalStatus('ready', 'Gravação pronta para download');
  }

  // --- Audio Volume & Mute Handlers ---
  function updateDesktopVolume(val) {
    if (desktopGainNode && !isDesktopMuted) {
      desktopGainNode.gain.value = val;
    }
  }

  function toggleDesktopMute() {
    isDesktopMuted = !isDesktopMuted;
    if (isDesktopMuted) {
      previousDesktopVol = parseFloat(desktopFader.value);
      if (desktopGainNode) desktopGainNode.gain.value = 0;
      desktopMuteBtn.classList.add('is-muted');
      desktopMuteIcon.textContent = '🔇';
      showToast('Áudio do desktop silenciado.');
    } else {
      if (desktopGainNode) desktopGainNode.gain.value = previousDesktopVol;
      desktopMuteBtn.classList.remove('is-muted');
      desktopMuteIcon.textContent = '🔊';
      showToast('Áudio do desktop ativado.');
    }
  }

  function updateMicVolume(val) {
    if (micGainNode && !isMicMuted) {
      micGainNode.gain.value = val;
    }
  }

  function toggleMicMute() {
    isMicMuted = !isMicMuted;
    if (isMicMuted) {
      previousMicVol = parseFloat(micFader.value);
      if (micGainNode) micGainNode.gain.value = 0;
      micMuteBtn.classList.add('is-muted');
      micMuteIcon.textContent = '🔇';
      showToast('Microfone silenciado.');
    } else {
      if (micGainNode) micGainNode.gain.value = previousMicVol;
      micMuteBtn.classList.remove('is-muted');
      micMuteIcon.textContent = '🎙️';
      showToast('Microfone ativado.');
    }
  }

  // --- Source Toggle Handlers ---
  function toggleMicSource() {
    isMicAudioEnabled = !isMicAudioEnabled;
    toggleMicBtn.classList.toggle('muted', !isMicAudioEnabled);
    micEyeIcon.textContent = isMicAudioEnabled ? '👁' : '🚫';
    sourceMicStatus.textContent = isMicAudioEnabled ? 'Ativo' : 'Desativado';
    showToast(isMicAudioEnabled ? 'Fonte de microfone ativada' : 'Fonte de microfone desativada');
  }

  function toggleSysAudioSource() {
    isDesktopAudioEnabled = !isDesktopAudioEnabled;
    toggleSysAudioBtn.classList.toggle('muted', !isDesktopAudioEnabled);
    sysEyeIcon.textContent = isDesktopAudioEnabled ? '👁' : '🚫';
    sourceSysAudioStatus.textContent = isDesktopAudioEnabled ? 'Ativo' : 'Desativado';
    showToast(isDesktopAudioEnabled ? 'Áudio do desktop ativado' : 'Áudio do desktop desativado');
  }

  // --- Scene Selection ---
  sceneItems.forEach((item) => {
    item.addEventListener('click', () => {
      sceneItems.forEach((s) => s.classList.remove('active'));
      item.classList.add('active');

      const scene = item.getAttribute('data-scene');
      if (scene === 'screen-only') {
        isDesktopAudioEnabled = false;
        isMicAudioEnabled = false;
        toggleMicBtn.classList.add('muted');
        toggleSysAudioBtn.classList.add('muted');
        micEyeIcon.textContent = '🚫';
        sysEyeIcon.textContent = '🚫';
        showToast('Cena selecionada: Apenas Tela (Mudo)');
      } else if (scene === 'narration') {
        isDesktopAudioEnabled = false;
        isMicAudioEnabled = true;
        toggleMicBtn.classList.remove('muted');
        toggleSysAudioBtn.classList.add('muted');
        micEyeIcon.textContent = '👁';
        sysEyeIcon.textContent = '🚫';
        showToast('Cena selecionada: Tutorial (Tela + Mic)');
      } else {
        isDesktopAudioEnabled = true;
        isMicAudioEnabled = true;
        toggleMicBtn.classList.remove('muted');
        toggleSysAudioBtn.classList.remove('muted');
        micEyeIcon.textContent = '👁';
        sysEyeIcon.textContent = '👁';
        showToast('Cena selecionada: Tela & Áudio Total');
      }
    });
  });

  // --- Quality & FPS Badge Update ---
  function updateQualityBadge() {
    const qText = qualitySelect.options[qualitySelect.selectedIndex].text.split('·')[1]?.trim() || '1080p';
    const fpsText = fpsSelect.value + ' FPS';
    canvasQualityBadge.textContent = `${qText} · ${fpsText}`;
    statusFpsMetric.innerHTML = `FPS: <strong>${fpsSelect.value}.00</strong>`;
  }

  // --- Event Listeners ---
  recordButton.addEventListener('click', initiateRecordingFlow);
  pauseButton.addEventListener('click', togglePause);
  skipCountdownBtn.addEventListener('click', cancelOrSkipCountdown);

  desktopFader.addEventListener('input', (e) => updateDesktopVolume(parseFloat(e.target.value)));
  micFader.addEventListener('input', (e) => updateMicVolume(parseFloat(e.target.value)));

  desktopMuteBtn.addEventListener('click', toggleDesktopMute);
  micMuteBtn.addEventListener('click', toggleMicMute);

  toggleMicBtn.addEventListener('click', toggleMicSource);
  toggleSysAudioBtn.addEventListener('click', toggleSysAudioSource);

  testMicBtn.addEventListener('click', () => initMicrophoneAudio(false));
  menuAudioBtn.addEventListener('click', () => initMicrophoneAudio(false));

  qualitySelect.addEventListener('change', updateQualityBadge);
  fpsSelect.addEventListener('change', updateQualityBadge);

  // Result Modal Actions
  closeResultModal.addEventListener('click', () => {
    resultModal.hidden = true;
    resultVideoPlayer.pause();
  });
  modalNewRecordBtn.addEventListener('click', () => {
    resultModal.hidden = true;
    resultVideoPlayer.pause();
    initiateRecordingFlow();
  });

  // Shortcuts Dialog
  function openShortcuts() { shortcutsModal.hidden = false; }
  function closeShortcuts() { shortcutsModal.hidden = true; }
  shortcutsBtn.addEventListener('click', openShortcuts);
  menuShortcutsBtn.addEventListener('click', openShortcuts);
  menuHelpBtn.addEventListener('click', openShortcuts);
  closeShortcutsModal.addEventListener('click', closeShortcuts);
  dismissShortcutsBtn.addEventListener('click', closeShortcuts);

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Avoid triggering when user is interacting with an input or select
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      return;
    }

    // Space: Start / Stop or Skip countdown
    if (e.code === 'Space') {
      e.preventDefault();
      if (isCountingDown) {
        cancelOrSkipCountdown();
      } else {
        initiateRecordingFlow();
      }
    }

    // Alt + R: Record / Stop
    if (e.altKey && (e.code === 'KeyR' || e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      initiateRecordingFlow();
    }

    // Alt + P: Pause / Resume
    if (e.altKey && (e.code === 'KeyP' || e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      togglePause();
    }

    // M: Toggle Mic
    if (e.code === 'KeyM' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      toggleMicMute();
    }

    // Escape: Dismiss Modal or Skip
    if (e.code === 'Escape') {
      if (isCountingDown) {
        cancelOrSkipCountdown();
      } else if (!resultModal.hidden) {
        resultModal.hidden = true;
        resultVideoPlayer.pause();
      } else if (!shortcutsModal.hidden) {
        closeShortcuts();
      }
    }
  });

  // Clean up on window unload
  window.addEventListener('beforeunload', () => {
    cleanupStreams();
    if (currentVideoUrl) URL.revokeObjectURL(currentVideoUrl);
  });

  // Initial badge update
  updateQualityBadge();

})();
