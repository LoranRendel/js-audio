const audio = {
    data: {},
    context: new AudioContext(),
    load: async (id, url) => new Promise(resolve => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = () => audio.context.decodeAudioData(request.response)
            .then(buffer => audio.data[id] = buffer).then(resolve);
        request.send();
    }),
    loadList: (data, basedir) => {
        const list = [];
        for (const [id, url] of Object.entries(data)) list.push(audio.load(id, `${basedir ?? '.'}/${url}`));
        return Promise.allSettled(list);
    },
    play: (id, volume = 1) => new Promise(resolve => {
        const source = audio.context.createBufferSource(), gainNode = audio.context.createGain();
        gainNode.gain.value = volume;
        gainNode.connect(audio.context.destination);
        source.connect(gainNode);
        source.buffer = audio.data[id];
        source.start();
        if (!audio.data[id]) {
            console.warn(`No audio file loaded with ID “${id}”`);
            resolve(false);
        }
        source.onended = () => resolve(true);
    }),
    loop: (id, volume = 1) => {
        const source = audio.context.createBufferSource(), gainNode = audio.context.createGain();
        gainNode.gain.value = volume;
        gainNode.connect(audio.context.destination);
        source.connect(gainNode);
        source.buffer = audio.data[id];
        source.loop = true;
        source.start();
        source.gain = gainNode.gain;
        return source;
    }
};