function isDesktop() {
    return true;
};

function MenuItem(name, cmd) {
    this.name = name;
    this.cmd = cmd;
    return this;
}
widget = new function () {
    this.setNavigationEnabled = function (b) { };
    this.preferenceForKey = function (b) { }; return this
};
menu = new function () {
    this.append = function (b) { };
    this.showSoftkeys = function (b) { };
    this.setRightSoftkeyLabel = function (b) { };
    this.setLeftSoftkeyLabel = function (b) { };
    this.remove = function (b) { };
    return this;
};
