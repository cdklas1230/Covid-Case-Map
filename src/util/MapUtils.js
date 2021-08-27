export const MapUtils = {
    /*
    To process backend data and aggregate by location(state, country)
    input: a list of county data points

    */
    getCovidPoints: function(points) {
        if(!points) {
            return {};
        }
        const nations = {
            type: "nation",
        };
        const states = {
            type: "state",
        }
        for(const point of points) {
            if(Number.isNaN(point.stats.confirmed) 
            || Number.isNaN(point.stats.deaths)
            || Number.isNaN(point.stats.deaths)) {
                console.error("Got dirty data:", point);
                continue;
            }

            /*
                states => object 
                {
                    "US": {
                        California: {
                            confirmed: xxx,
                            deaths: xxx,
                            recovered: xxx,
                            coordinates: {
                                ...
                            }
                        }
                    }
                }
            */
            // aggregate by state
            states[point.country] = states[point.country] || {};
            states[point.country][point.province] = states[point.country][point.province] || {
                confirmed: 0,
                deaths: 0,
                recovered: 0,
            };
            states[point.country][point.province].confirmed += point.stats.confirmed;
            states[point.country][point.province].deaths += point.stats.deaths;
            states[point.country][point.province].recovered += point.stats.recovered;
            states[point.country][point.province].coordinates = 
                states[point.country][point.province].coordinates || point.coordinates;
        }
        // aggregate by nation

        // nation 1-4: nation; state 5-9; county 10-20
        const result = {};
        let i = 1;
        for(; i <= 4; i++) {
            result[i] = nations;
        }
        for(; i <= 9; i++) {
            result[i] = states;
        }
        for(; i <= 20; i++) {
            result[i] = points;
        }
        return result;
    },
    isInBoundary: function(bounds, coordinates) {
        return coordinates && bounds && bounds.nw && bounds.se && 
        ((coordinates.longitude >= bounds.nw.lng && coordinates.longitude <= bounds.se.lng) 
        || (coordinates.longitude <= bounds.nw.lng && coordinates.longitude >= bounds.se.lng))
        && ((coordinates.latitude >= bounds.se.lat && coordinates.latitude <= bounds.nw.lat) 
        || (coordinates.latitude <= bounds.se.lat && coordinates.latitude >= bounds.nw.lat));
    }
}