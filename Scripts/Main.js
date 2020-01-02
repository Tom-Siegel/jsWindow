var T = function () {
    var Me = this;
    

    this.Request = (_data, _url, _options) => {
        var xhr = new XMLHttpRequest();
        var opt = { Method: "GET", Timeout: 5000 }

        xhr.open(opt.Method, _url);
        xhr.timeout = opt.Timeout;
        xhr.send(_data);
    }

    this.Override = (_src, obj) => {
        for (var i of obj) { if (_src.hasOwnProperty(i)) _src[i] = obj[i]; }
    }

}
  
