import express from 'express';
import fetch from 'node-fetch';
import crypto from 'crypto';
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const rooms = {};
const clients = {};
import * as WS from 'express-ws';
const expressWs = WS(app);

expressWs.getWss().on('connection',(ws, req)=>{
    // ws.send(JSON.stringify({type: 'connected'}));
});

app.get('/rooms', (req,res)=>{
    return res.send(Object.keys(rooms));
})

app.get('/clients', (req,res)=>{
    return res.send(Object.keys(clients));
})

app.get('/room/init', (req, res) => {
    const roomId = crypto.randomBytes(16).toString("hex");
    rooms[roomId] = [];
    return res.send({room_id: roomId});
});

app.ws('/room/join/:id', (ws,req)=>{
    const roomId = req.params.id;
    const clientId = crypto.randomBytes(16).toString("base64");
    clients[clientId] = ws;
    rooms[roomId].forEach((it)=>{
        ws.send(JSON.stringify({type:'create_offer', data: {id: it}}));
    })
    ws.on('message', (data)=>{
        const msg = JSON.parse(data);
        if(msg.type === 'offer'){
            console.log('offer');
            clients[msg.data.id].send(JSON.stringify({type:'create_ans', data:{id: clientId, offer: msg.data.offer}}))
        }
        if(msg.type === 'answer'){
            console.log('answer');
            clients[msg.data.id].send(JSON.stringify({type:'receive_ans', data:{id: clientId,  answer:msg.data.answer}}))
        }
    })
    rooms[roomId].push(clientId);
    ws.on('close',()=>{
        if(rooms[roomId].length === 1){
            delete rooms[roomId];
        }
        delete clients[clientId];
    })
})

app.listen(PORT,()=>{
    console.log("listening...");
});
