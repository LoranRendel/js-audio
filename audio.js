class audio {
    static _data = {};
    static _context = new (window.AudioContext ?? window.webkitAudioContext)();
    static _playingSingles = {};

    /**
     * Get buffer source of a loaded file
     *
     * @param {string} id Audio file ID
     * @param {number} volume Volume coefficient
     * @returns {AudioBufferSourceNode|void}
     */
    static _getSource = (id, volume = 1) => {
        if (!audio._data[id]) {
            console.warn(`No audio file loaded with ID “${id}”`);
            return;
        }
        const source = audio._context.createBufferSource(), gainNode = audio._context.createGain();
        gainNode.gain.value = volume;
        gainNode.connect(audio._context.destination);
        source.connect(gainNode);
        source.buffer = audio._data[id];
        source.setVolume = volume => gainNode.gain.value = volume;
        return source;
    }

    /**
     * @param {string} id
     * @param {string} url
     */
    static load = async (id, url) => new Promise(resolve => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = () => audio._context.decodeAudioData(
            request.response, buffer => {
                audio._data[id] = buffer;
                resolve();
            });
        request.send();
    })
    static loadList = (data, basedir) => {
        const list = [];
        for (const [id, url] of Object.entries(data)) list.push(audio.load(id, `${basedir ?? '.'}/${url}`));
        Promise.allSettled ??= promises => Promise.all(promises.map(p => p
            .then(value => ({status: 'fulfilled', value}))
            .catch(reason => ({status: 'rejected', reason})))
        );
        return Promise.allSettled(list);
    }
    static play = (id, volume = 1) => new Promise(resolve => {
        const source = audio._getSource(id, volume);
        if (!source) return resolve(false);
        source.onended = () => resolve(true);
        source.start(0);
    })
    static playSingle = (id, volume = 1) => new Promise(resolve => {
        const source = audio._getSource(id, volume);
        if (!source) return resolve(false);
        if (audio._playingSingles[id]) audio._playingSingles[id].stop();
        audio._playingSingles[id] = source;
        source.onended = () => resolve(true);
        source.start(0);
    })

    /**
     * Loop sound
     *
     * @param {string} id Audio file ID
     * @param {number} volume Volume coefficient
     * @returns {AudioBufferSourceNode|void}
     */
    static loop = (id, volume = 1) => {
        const source = audio._getSource(id, volume);
        if (!source) return;

        source.loop = true;
        source.start(0);
        return source;
    }
}