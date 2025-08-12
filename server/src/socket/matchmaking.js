module.exports = function matchmaking(io) {
  const queue = [] // { socketId, userId, level }

  io.on('connection', (socket) => {
    // Join queue
    socket.on('join_queue', ({ userId, level }) => {
      if (!userId) return
      // avoid duplicates
      if (!queue.find(q => q.socketId === socket.id)) {
        queue.push({ socketId: socket.id, userId, level: level || 'beginner' })
        tryMatch()
      }
    })

    socket.on('leave_queue', () => removeFromQueue(socket.id))

    socket.on('disconnect', () => removeFromQueue(socket.id))

    // WebRTC signaling relay
    socket.on('webrtc_offer', ({ roomId, to, sdp }) => {
      if (to) io.to(to).emit('webrtc_offer', { from: socket.id, sdp })
      else io.to(roomId).emit('webrtc_offer', { from: socket.id, sdp })
    })
    socket.on('webrtc_answer', ({ roomId, to, sdp }) => {
      if (to) io.to(to).emit('webrtc_answer', { from: socket.id, sdp })
      else io.to(roomId).emit('webrtc_answer', { from: socket.id, sdp })
    })
    socket.on('webrtc_ice', ({ roomId, to, candidate }) => {
      if (to) io.to(to).emit('webrtc_ice', { from: socket.id, candidate })
      else io.to(roomId).emit('webrtc_ice', { from: socket.id, candidate })
    })

    function removeFromQueue(id) {
      const idx = queue.findIndex(q => q.socketId === id)
      if (idx !== -1) queue.splice(idx, 1)
    }

    function tryMatch() {
      if (queue.length < 2) return
      // simple: match first two with same level if possible
      queue.sort((a,b) => a.level.localeCompare(b.level))
      for (let i = 0; i < queue.length - 1; i++) {
        const a = queue[i]
        const b = queue[i+1]
        if (a && b && a.socketId !== b.socketId && (a.level === b.level)) {
          queue.splice(i, 2)
          const roomId = `room_${a.socketId.slice(-4)}_${b.socketId.slice(-4)}`
          // join room and notify
          io.sockets.sockets.get(a.socketId)?.join(roomId)
          io.sockets.sockets.get(b.socketId)?.join(roomId)
          io.to(a.socketId).emit('match_found', { roomId, peerId: b.socketId })
          io.to(b.socketId).emit('match_found', { roomId, peerId: a.socketId })
          return
        }
      }
      // if not matched by level, match first two anyway
      if (queue.length >= 2) {
        const [a, b] = queue.splice(0, 2)
        const roomId = `room_${a.socketId.slice(-4)}_${b.socketId.slice(-4)}`
        io.sockets.sockets.get(a.socketId)?.join(roomId)
        io.sockets.sockets.get(b.socketId)?.join(roomId)
        io.to(a.socketId).emit('match_found', { roomId, peerId: b.socketId })
        io.to(b.socketId).emit('match_found', { roomId, peerId: a.socketId })
      }
    }
  })
}
