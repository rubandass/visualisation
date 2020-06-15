
var request = require('request');
module.exports = {
    index(req, res) {
        request({
            uri: `${BASE_URL}/countries/${req.query.country}`
        }).pipe(res);

    },
    update(req, res) {
        request.post(`${BASE_URL}/country/edit`, {
            json: {
                data: req.body
            }
        }).pipe(res);
    },
    delete(req, res) {
        request.delete(`${BASE_URL}/country/delete`, {
            json: {
                data: req.body
            }
        }).pipe(res);
    }
}