var timer = {
    elapsed:0,
    last:new Date().getTime(),

    tick:function () {
        var now = new Date().getTime();
        this.elapsed += now - this.last;
        this.last = now;
        return this;
    },

    reset:function () {
        this.elapsed = 0;
        this.last = new Date().getTime()
    }

}