let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioElement;

function showScreen(screenId) {
    document.getElementById('screen1').style.display = 'none';
    document.getElementById('screen2').style.display = 'none';
    document.getElementById('screen3').style.display = 'none';
    document.getElementById('screen4').style.display = 'none';
    document.getElementById('screen5').style.display = 'none';
    document.getElementById('screen6').style.display = 'none';
    document.getElementById('screen7').style.display = 'none';
    document.getElementById('screen8').style.display = 'none';
    document.getElementById('screen9').style.display = 'none';
    
    document.getElementById(screenId).style.display = 'flex';
}

function showEditProfile() {
    showScreen('screen9');
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (message === '') return;
    
    const chatBody = document.getElementById('chat-body');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'msg msg-entregador';
    
    messageDiv.innerHTML = `
        <i class="bi bi-person-circle fs-4"></i>
        <div class="texto">${message}</div>
    `;
    
    chatBody.appendChild(messageDiv);
    messageInput.value = '';
    
    setTimeout(() => {
        const responseDiv = document.createElement('div');
        responseDiv.className = 'msg msg-cliente';
        
        responseDiv.innerHTML = `
            <img src="https://i.postimg.cc/9MKDXQKZ/2025-08-24-15-05.png" alt="Cliente">
            <div class="texto">Olá, em que posso ajudar?</div>
        `;
        
        chatBody.appendChild(responseDiv);
    }, 2000);
}

async function toggleAudioRecording() {
    if (isRecording) {
        stopAudioRecording();
    } else {
        await startAudioRecording();
    }
}

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
        
        document.getElementById('recording-indicator').style.display = 'flex';
        
    } catch (error) {
        console.error('Erro ao acessar microfone:', error);
    }
}

function stopAudioRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        document.getElementById('recording-indicator').style.display = 'none';
    }
}

function sendAudioMessage(audioBlob) {
    const chatBody = document.getElementById('chat-body');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'msg msg-entregador';
    
    const audioUrl = URL.createObjectURL(audioBlob);
    
    messageDiv.innerHTML = `
        <i class="bi bi-person-circle fs-4"></i>
        <div class="texto audio-message" onclick="playAudio(this)" data-audio-url="${audioUrl}">
            <i class="bi bi-play-fill"></i> 
            <span>Áudio</span>
            <div class="audio-duration">0:05</div>
        </div>
    `;
    
    chatBody.appendChild(messageDiv);
}

function playAudio(element) {
    const audioUrl = element.getAttribute('data-audio-url');
    
    if (audioElement) {
        audioElement.pause();
    }
    
    audioElement = new Audio(audioUrl);
    audioElement.play();
}

document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
