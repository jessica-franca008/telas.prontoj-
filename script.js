let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioElement;

function showScreen(screenId) {
    const screens = ['screen1', 'screen2', 'screen3', 'screen4', 'screen5', 'screen6', 'screen7', 'screen8', 'screen9'];
    screens.forEach(screen => {
        document.getElementById(screen).style.display = 'none';
    });
    
    document.getElementById(screenId).style.display = 'flex';
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
        <span class="msg-hora">${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}</span>
    `;
    
    chatBody.appendChild(messageDiv);
    messageInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
    
    setTimeout(() => {
        const responseDiv = document.createElement('div');
        responseDiv.className = 'msg msg-cliente';
        
        responseDiv.innerHTML = `
            <img src="https://i.postimg.cc/9MKDXQKZ/2025-08-24-15-05.png" alt="Cliente">
            <div class="texto">Olá, em que posso ajudar?</div>
            <span class="msg-hora">${new Date().getHours()}:${(new Date().getMinutes() + 1).toString().padStart(2, '0')}</span>
        `;
        
        chatBody.appendChild(responseDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
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
        alert('Não foi possível acessar o microfone. Verifique as permissões.');
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
        <span class="msg-hora">${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}</span>
    `;
    
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function playAudio(element) {
    const audioUrl = element.getAttribute('data-audio-url');
    
    if (audioElement) {
        audioElement.pause();
        document.querySelectorAll('.audio-message').forEach(msg => {
            msg.classList.remove('playing');
            msg.querySelector('i').className = 'bi bi-play-fill';
        });
    }
    
    audioElement = new Audio(audioUrl);
    
    element.classList.add('playing');
    element.querySelector('i').className = 'bi bi-pause-fill';
    
    audioElement.play();
    
    audioElement.onended = () => {
        element.classList.remove('playing');
        element.querySelector('i').className = 'bi bi-play-fill';
    };
    
    audioElement.onpause = () => {
        element.classList.remove('playing');
        element.querySelector('i').className = 'bi bi-play-fill';
    };
}

function showEditProfile() {
    showScreen('screen9');
    
    document.getElementById('edit-name').value = "Mariana";
    document.getElementById('edit-phone').value = "(89) 994856218";
    document.getElementById('edit-email').value = "mariana@email.com";
    document.getElementById('edit-cep').value = "64605500";
    document.getElementById('edit-address').value = "Rua Projetada, 132 Quadra 5, Casa 15";
    document.getElementById('edit-neighborhood').value = "Bairro Pantanal, Picos - PI";
    document.getElementById('edit-password').value = "";
    document.getElementById('edit-confirm-password').value = "";
}

function saveProfile() {
    const name = document.getElementById('edit-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const cep = document.getElementById('edit-cep').value.trim();
    const address = document.getElementById('edit-address').value.trim();
    const neighborhood = document.getElementById('edit-neighborhood').value.trim();

    if (!name || !phone || !email || !cep || !address || !neighborhood) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, insira um email válido.');
        return;
    }

    const newPassword = document.getElementById('edit-password').value;
    const confirmPassword = document.getElementById('edit-confirm-password').value;
    
    if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
    }

    showScreen('screen7');
}

async function searchCEP(cep) {
    if (cep.length === 8) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('edit-address').value = `${data.logradouro}, ${data.complemento || ''}`.trim();
                document.getElementById('edit-neighborhood').value = `${data.bairro}, ${data.localidade} - ${data.uf}`;
            } else {
                alert('CEP não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }
}

function changeProfilePicture() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ser menor que 5MB.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const profilePicture = document.getElementById('profile-picture');
                profilePicture.src = e.target.result;
                
                const profilePicMain = document.querySelector('#screen7 .top-bar img');
                if (profilePicMain) {
                    profilePicMain.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
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
    
    document.addEventListener('click', function(e) {
        const indicator = document.getElementById('recording-indicator');
        if (isRecording && indicator && !indicator.contains(e.target) && 
            !e.target.closest('.audio-btn')) {
            stopAudioRecording();
        }
    });
});

