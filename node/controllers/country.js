var request = require('request');
module.exports = {
    index(req, res) {
        request({
            uri: `${BASE_URL}/countries`
        }).pipe(res);
    }
}