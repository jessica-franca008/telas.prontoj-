// Variáveis globais para controle de áudio
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioElement;

// Função para navegar entre telas
function showScreen(screenId) {
  // Oculta todas as telas
  document.getElementById('screen1').style.display = 'none';
  document.getElementById('screen2').style.display = 'none';
  document.getElementById('screen3').style.display = 'none';
  document.getElementById('screen4').style.display = 'none';
  document.getElementById('screen5').style.display = 'none';
  document.getElementById('screen6').style.display = 'none';
  document.getElementById('screen7').style.display = 'none';
  document.getElementById('screen8').style.display = 'none';
  
  // Mostra a tela solicitada
  document.getElementById(screenId).style.display = 'flex';
}

// Função para enviar mensagem no chat
function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  
  if (message === '') return;
  
  const chatBody = document.getElementById('chat-body');
  
  // Cria uma nova mensagem do entregador
  const messageDiv = document.createElement('div');
  messageDiv.className = 'msg msg-entregador';
  
  messageDiv.innerHTML = `
    <i class="bi bi-person-circle fs-4"></i>
    <div class="texto">${message}</div>
  `;
  
  // Adiciona a mensagem ao chat
  chatBody.appendChild(messageDiv);
  
  // Limpa o campo de entrada
  messageInput.value = '';
  
  // Rola para a última mensagem
  chatBody.scrollTop = chatBody.scrollHeight;
  
  // Simula uma resposta automática de TEXTO após 2 segundos (apenas para mensagens de texto)
  setTimeout(() => {
    const responseDiv = document.createElement('div');
    responseDiv.className = 'msg msg-cliente';
    
    responseDiv.innerHTML = `
      <img src="https://i.postimg.cc/9MKDXQKZ/2025-08-24-15-05.png" alt="Cliente">
      <div class="texto">Olá, em que posso ajudar?</div>
    `;
    
    chatBody.appendChild(responseDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 2000);
}

// Função para iniciar/parar gravação de áudio
async function toggleAudioRecording() {
  if (isRecording) {
    stopAudioRecording();
  } else {
    await startAudioRecording();
  }
}

// Função para iniciar gravação de áudio
async function startAudioRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      sendAudioMessage(audioBlob);
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    isRecording = true;
    
    // Mostra o indicador de gravação
    document.getElementById('recording-indicator').style.display = 'flex';
    
  } catch (error) {
    console.error('Erro ao acessar microfone:', error);
    alert('Não foi possível acessar o microfone. Verifique as permissões.');
  }
}

// Função para parar gravação de áudio
function stopAudioRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    
    // Esconde o indicador de gravação
    document.getElementById('recording-indicator').style.display = 'none';
  }
}

// Função para enviar mensagem de áudio
function sendAudioMessage(audioBlob) {
  const chatBody = document.getElementById('chat-body');
  
  // Cria uma nova mensagem de áudio do entregador
  const messageDiv = document.createElement('div');
  messageDiv.className = 'msg msg-entregador';
  
  // Cria um URL para o áudio
  const audioUrl = URL.createObjectURL(audioBlob);
  
  messageDiv.innerHTML = `
    <i class="bi bi-person-circle fs-4"></i>
    <div class="texto audio-message" onclick="playAudio(this)" data-audio-url="${audioUrl}">
      <i class="bi bi-play-fill"></i> 
      <span>Áudio</span>
      <div class="audio-duration">0:05</div>
    </div>
  `;
  
  // Adiciona a mensagem ao chat
  chatBody.appendChild(messageDiv);
  
  // Rola para a última mensagem
  chatBody.scrollTop = chatBody.scrollHeight;
  
  // NÃO envia resposta automática de áudio do cliente
}

// Função para reproduzir áudio
function playAudio(element) {
  const audioUrl = element.getAttribute('data-audio-url');
  
  // Para qualquer áudio que esteja tocando
  if (audioElement) {
    audioElement.pause();
    document.querySelectorAll('.audio-message').forEach(msg => {
      msg.classList.remove('playing');
      msg.querySelector('i').className = 'bi bi-play-fill';
    });
  }
  
  // Cria novo elemento de áudio
  audioElement = new Audio(audioUrl);
  
  // Atualiza o ícone para "playing"
  element.classList.add('playing');
  element.querySelector('i').className = 'bi bi-pause-fill';
  
  // Reproduz o áudio
  audioElement.play();
  
  // Quando o áudio terminar
  audioElement.onended = () => {
    element.classList.remove('playing');
    element.querySelector('i').className = 'bi bi-play-fill';
  };
  
  // Quando o áudio for pausado
  audioElement.onpause = () => {
    element.classList.remove('playing');
    element.querySelector('i').className = 'bi bi-play-fill';
  };
}

// Permite enviar mensagem pressionando Enter
document.addEventListener('DOMContentLoaded', function() {
  const messageInput = document.getElementById('message-input');
  if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  // Para a gravação se clicar fora do indicador
  document.addEventListener('click', function(e) {
    const indicator = document.getElementById('recording-indicator');
    if (isRecording && indicator && !indicator.contains(e.target) && 
        !e.target.closest('.audio-btn')) {
      stopAudioRecording();
    }
  });
});
