const audio = {
    _data: {},
    _context: new (window.AudioContext ?? window.webkitAudioContext)(),
    _playingSingles: {},
    _getSource: (id, volume = 1) => {
        if (!audio._data[id]) {
            console.warn(`No audio file loaded with ID “${id}”`);
            return;
        }
        const source = audio._context.createBufferSource(), gainNode = audio._context.createGain();
        gainNode.gain.value = volume;
        gainNode.connect(audio._context.destination);
        source.connect(gainNode);
        source.buffer = audio._data[id];
        source.gain = gainNode.gain; // to have possibility to change the volume
        return source;
    },
    load: async (id, url) => new Promise(resolve => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = () => audio._context.decodeAudioData(
            request.response, (buffer) => {
                audio._data[id] = buffer;
                resolve();
            });
        request.send();
    }),
    loadList: (data, basedir) => {
        const list = [];
        for (const [id, url] of Object.entries(data)) list.push(audio.load(id, `${basedir ?? '.'}/${url}`));
        Promise.allSettled ??= promises => Promise.all(promises.map(p => p
            .then(value => ({status: 'fulfilled', value,}))
            .catch(reason => ({status: 'rejected', reason,})))
        );
        return Promise.allSettled(list);
    },
    play: (id, volume = 1) => new Promise(resolve => {
        const source = audio._getSource(id, volume);
        if (!source) return resolve(false);
        source.onended = () => resolve(true);
        source.start(0);
    }),
    playSingle: (id, volume = 1) => new Promise(resolve => {
        const source = audio._getSource(id, volume);
        if (!source) return resolve(false);
        if (audio._playingSingles[id]) audio._playingSingles[id].stop();
        audio._playingSingles[id] = source;
        source.onended = () => resolve(true);
        source.start(0);
    }),
    loop: (id, volume = 1) => {
        const source = audio._getSource(id, volume);
        source.loop = true;
        source.start(0);
    }
};