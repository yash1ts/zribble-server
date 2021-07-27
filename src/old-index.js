import express from 'express';
import fetch from 'node-fetch';
import crypto from 'crypto';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;
const rooms = {};
const client = {};
import * as WS from 'express-ws';
const expressWs = WS(app);

expressWs.getWss().on('connection',(ws, req)=>{
    // ws.send(JSON.stringify({type: 'connected'}));
});

app.get('/rooms', (req,res)=>{
    return res.send(Object.keys(rooms));
})

app.get('/clients', (req,res)=>{
    return res.send(Object.keys(client));
})

app.ws('/room/init', (ws, req) => {
    const id = crypto.randomBytes(16).toString("base64");
    rooms[id] = ws;
    ws.id = id;
    ws.on('message',(t)=>{
        const msg = JSON.parse(t)
        if(msg.type === 'answer'){
            console.log('got answer'+msg.data.id)
            client[msg.data.id].send(JSON.stringify({type:'receive_ans', data: msg.data.sdp}));
        }
    });
    ws.send(JSON.stringify({type: 'create_link',data: {id}}));

    ws.on('close',()=>{
        delete rooms[id];
    });
});

app.ws('/room/join/:id', (ws,req)=>{
    const roomId = req.params.id;
    const id = crypto.randomBytes(16).toString("base64");
    ws.id = roomId;
    client[id] = ws;
    
    ws.on('message', (t)=>{
        const msg = JSON.parse(t)
        if(msg.type === 'join'){
            console.log('join request' + roomId)
        rooms[roomId].send(JSON.stringify({type: 'create_ans', data: {id, sdp: msg.data}}));
        }
    })

    ws.on('close',()=>{
        delete client[id];
    })
})

app.listen(PORT,()=>{
    console.log("listening...");
});
