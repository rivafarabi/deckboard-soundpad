const net = require('net');
const xmljs = require('xml-js');

const PIPE_NAME = '\\\\.\\pipe\\sp_remote_control'

var pipe = null;
var socket = null;
var currentRequest = null;

function init() {
    return new Promise((resolve, reject) => {
        try {
            if (pipe === null) {
                socket = net.createConnection(PIPE_NAME, () => {
                    console.log('CONNECTED')
                    pipe = socket;

                    resolve();
                })
                socket.on('error', err => reject(err))
            } else resolve();
        } catch (err) {
            reject(err);
        }
    })

}

async function sendRequest(request, callback, onError) {
    try {
        await init();
        setTimeout(() => {
            if (!!currentRequest) return;

            currentRequest = request;

            pipe.on('data', res => {
                try {
                    if (currentRequest !== request) throw 'Current request not match';

                    const jsonRes = xmljs.xml2json(res.toString('utf8'), { compact: true })
                    const { _declaration, ...data } = JSON.parse(jsonRes);
                    callback(data);
                } catch (err) {
                    callback()
                } finally {
                    pipe.removeAllListeners('data', () => console.log('listener removed'));
                    currentRequest = null;
                }
            })

            pipe.write(request);
            pipe.read(socket.bytesWritten)
            return

        }, 100)
    } catch (err) {
        console.log('sendRequest ERR:', { err });
        if (pipe != null) {
            pipe.end()
        }
        pipe = null;
        onError(err);
    }
}

function playSound(index, renderLine = true, captureLine = true) {
    return new Promise((resolve, reject) => {
        sendRequest(`DoPlaySound(${index}, ${renderLine}, ${captureLine})`,
            resolve,
            reject
        )
    });
}

function getSoundList() {
    return new Promise((resolve, reject) => {
        sendRequest(
            'GetSoundList()',
            response => {
                try {
                    const { Soundlist } = response;
                    const data = Soundlist.Sound.map(({ _attributes }) => {
                        const { index, title } = _attributes;
                        return {
                            label: title,
                            value: parseInt(index)
                        }
                    })
                    resolve(data);
                }
                catch (err) {
                    resolve([])
                }
            },
            reject
        );
    })
}

module.exports = {
    init,
    playSound,
    getSoundList
}