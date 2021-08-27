import axios from "axios"

export const MapServices = {
    getUSCovidData: function() {
        return axios.get('https://corona.lmao.ninja/v2/jhucsse/counties');
    }
}