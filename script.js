const startButton = document.querySelector('#startButton');
const pauseButton = document.querySelector('#pauseButton');
const stopButton = document.querySelector('#stopButton');
const preview = document.querySelector('#previewArea');
const previewVideo = document.querySelector('#previewVideo');
const previewEmpty = document.querySelector('#previewEmpty');
const liveIndicator = document.querySelector('#liveIndicator');
const timerDisplay = document.querySelector('#timerDisplay');
const statusPill = document.querySelector('#statusPill');
const statusText = document.querySelector('#statusText');
const resultPanel = document.querySelector('#resultPanel');
const downloadLink = document.querySelector('#downloadLink');
const resultDetails = document.querySelector('#resultDetails');
const toast = document.querySelector('#toast');
const qualitySelect = document.querySelector('#qualitySelect');
const systemAudioToggle = document.querySelector('#systemAudio');
const microphoneToggle = document.querySelector('#microphone');

let displayStream = null;
let microphoneStream = null;
let recorder = null;
let recordedChunks = [];
let timerInterval = null;
let startedAt = 0;
let pausedAt = 0;
let pausedDuration = 0;
let toastTimeout = null;
let previousObjectUrl = null;

const qualityBitrates = {
  standard: 2_500_000,
  high: 5_000_000,
  maximum: 8_000_000,
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), 5000);
}

function setStatus(state, text) {
  statusPill.classList.toggle('is-recording', state === 'recording');
  statusPill.classList.toggle('is-paused', state === 'paused');
  statusText.textContent = text;
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function updateTimer() {
  const currentPause = pausedAt ? Date.now() - pausedAt : 0;
  timerDisplay.textContent = formatTime(Date.now() - startedAt - pausedDuration - currentPause);
}

function getSupportedMimeType() {
  if (typeof MediaRecorder.isTypeSupported !== 'function') return '';

  return [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ].find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function stopTracks(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

function releaseStreams() {
  stopTracks(displayStream);
  stopTracks(microphoneStream);
  displayStream = null;
  microphoneStream = null;
  previewVideo.srcObject = null;
  preview.classList.remove('has-video');
  previewEmpty.hidden = false;
  liveIndicator.hidden = true;
  timerDisplay.hidden = true;
}

function resetControls() {
  window.clearInterval(timerInterval);
  timerInterval = null;
  startButton.disabled = false;
  pauseButton.disabled = true;
  stopButton.disabled = true;
  pauseButton.innerHTML = '<span class="pause-icon" aria-hidden="true">Ⅱ</span> Pausar';
}

function finishRecording() {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
  }
}

async function startRecording() {
  if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === 'undefined') {
    showToast('A gravação de tela não está disponível neste navegador. Abra esta página em uma versão recente do Chrome, Edge ou Firefox.');
    return;
  }

  startButton.disabled = true;
  resultPanel.hidden = true;

  try {
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 30, max: 60 } },
      audio: systemAudioToggle.checked,
      systemAudio: systemAudioToggle.checked ? 'include' : 'exclude',
    });

    if (microphoneToggle.checked) {
      microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    const audioTracks = [
      ...displayStream.getAudioTracks(),
      ...(microphoneStream?.getAudioTracks() || []),
    ];
    const recordingStream = new MediaStream([
      ...displayStream.getVideoTracks(),
      ...audioTracks,
    ]);
    const mimeType = getSupportedMimeType();
    const recorderOptions = { videoBitsPerSecond: qualityBitrates[qualitySelect.value] };
    if (mimeType) recorderOptions.mimeType = mimeType;

    recordedChunks = [];
    recorder = new MediaRecorder(recordingStream, recorderOptions);
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    });
    recorder.addEventListener('stop', handleRecordingComplete, { once: true });
    recorder.addEventListener('error', () => {
      showToast('Ocorreu um erro durante a gravação. Tente novamente.');
      resetControls();
      releaseStreams();
      setStatus('ready', 'Pronto para gravar');
    }, { once: true });

    previewVideo.srcObject = displayStream;
    preview.classList.add('has-video');
    previewEmpty.hidden = true;
    liveIndicator.hidden = false;
    timerDisplay.hidden = false;
    resultPanel.hidden = true;

    displayStream.getVideoTracks()[0]?.addEventListener('ended', finishRecording, { once: true });
    recorder.start(1000);
    startedAt = Date.now();
    pausedAt = 0;
    pausedDuration = 0;
    updateTimer();
    timerInterval = window.setInterval(updateTimer, 250);

    pauseButton.disabled = false;
    stopButton.disabled = false;
    setStatus('recording', 'Gravando agora');
  } catch (error) {
    releaseStreams();
    startButton.disabled = false;
    if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
      showToast('Compartilhamento cancelado. Quando quiser, você pode começar novamente.');
    } else if (error.name === 'NotFoundError') {
      showToast('Não foi encontrada uma tela disponível para compartilhar.');
    } else if (microphoneToggle.checked && error.name === 'NotReadableError') {
      showToast('Não foi possível acessar o microfone. Verifique se ele está sendo usado por outro aplicativo.');
    } else {
      showToast(`Não foi possível iniciar a gravação: ${error.message || 'verifique as permissões do navegador.'}`);
    }
    setStatus('ready', 'Pronto para gravar');
  }
}

function handleRecordingComplete() {
  const mimeType = recorder?.mimeType || 'video/webm';
  const videoBlob = new Blob(recordedChunks, { type: mimeType });
  const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';

  resetControls();
  releaseStreams();
  setStatus('ready', 'Gravação finalizada');

  if (videoBlob.size === 0) {
    showToast('O navegador não gerou um arquivo de vídeo. Tente gravar novamente.');
    return;
  }

  if (previousObjectUrl) URL.revokeObjectURL(previousObjectUrl);
  previousObjectUrl = URL.createObjectURL(videoBlob);
  downloadLink.href = previousObjectUrl;
  downloadLink.download = `gravacao-de-tela-${new Date().toISOString().slice(0, 10)}.${extension}`;
  resultDetails.textContent = `${formatFileSize(videoBlob.size)} · ${extension.toUpperCase()}`;
  resultPanel.hidden = false;
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function togglePause() {
  if (!recorder) return;

  if (recorder.state === 'recording') {
    recorder.pause();
    pausedAt = Date.now();
    pauseButton.innerHTML = '<span class="pause-icon" aria-hidden="true">▶</span> Retomar';
    setStatus('paused', 'Gravação pausada');
  } else if (recorder.state === 'paused') {
    recorder.resume();
    pausedDuration += Date.now() - pausedAt;
    pausedAt = 0;
    pauseButton.innerHTML = '<span class="pause-icon" aria-hidden="true">Ⅱ</span> Pausar';
    setStatus('recording', 'Gravando agora');
  }
}

startButton.addEventListener('click', startRecording);
pauseButton.addEventListener('click', togglePause);
stopButton.addEventListener('click', finishRecording);
document.querySelector('#dismissResult').addEventListener('click', () => {
  resultPanel.hidden = true;
});

window.addEventListener('beforeunload', () => {
  releaseStreams();
  if (previousObjectUrl) URL.revokeObjectURL(previousObjectUrl);
});
