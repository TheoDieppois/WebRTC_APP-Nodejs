const socket = io('/')

const videoGrid = document.querySelector('#video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

let peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
}); 


let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream)
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

let msg = document.querySelector('input')

document.querySelector('html').addEventListener('keydown', (e) => {
    if(e.which === 13 && msg.value.length !== 0) {
        socket.emit('message', msg.value)
        msg.value = ''
    }
})

socket.on('createMessage', message => {
    const li = document.createElement('li')
    li.innerHTML = message
    document.querySelector('.messages').append(li)
    ScrollToBottom()
})

const ScrollToBottom = () => {
    const d = document.querySelector('.main__chat__window')
    d.scrollTop = d.scrollHeight
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled
    if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false
        setUnmuteButton()
    } else {
        setMuteButton()
        myVideoStream.getAudioTracks()[0].enabled = true
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Muet</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Activer le micro</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled
    if(enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false
        setStopVideo()
    } else {
        setPlayVideo()
        myVideoStream.getVideoTracks()[0].enabled = true
    }
}

const setPlayVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Couper la vidéo</span>
    `
    document.querySelector('.main__video__button').innerHTML = html
}

const setStopVideo = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Activer la vidéo</span>
    `
    document.querySelector('.main__video__button').innerHTML = html
}