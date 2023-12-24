import polyline from 'google-polyline';

class TrafficStore {

    constructor(api) {
        this.api = api;
    }

    getTrafficPath(stops) {
        if (!stops || stops.length < 2) {
            console.log('no path')
            return Promise.resolve([])
        }
        stops = stops.filter(s => s.status !== 'DISCARDED')
        let paths = []
        let last = null;
        for (const stop of stops) {
            const { location } = stop
            const { latitude, longitude } = location || {}
            if (!latitude) {
                // ignored
            }
            else if (last != null && Math.abs(latitude - last[0]) + Math.abs(longitude - last[1]) < 1e-5) {
                // ignored
            } else {
                last = [latitude, longitude];
                paths.push(last);
            }
        }
        if (paths.length < 2) {
            console.log('no path')
            return Promise.resolve([])
        }

        return this.api.post('/route', {points: paths})
            .then(response => {
                if (response.status === 200) {
                    const { line } = response.data || {}
                    if (!line) return [];
                    const latlngs = polyline.decode(line);
                    return latlngs
                } else {
                    return []
                }
            })
    }
}

export default TrafficStore;
