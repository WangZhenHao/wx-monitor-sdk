

function report(options) {
    this.config = options
}

report.prototype = {
    request(route, parmas) {
        const {
            url,
            key
        } = this.config;

        if(!key) {
            throw new Error('please set sdk key');
            return
        }

        if(!url) {
            throw new Error('please set sdk url');
        }
        

        wx.rewriteRequest({
            url: url + route, 
            method: 'POST',
            data: parmas
        })

    }
}

export default report