var win = Ti.UI.createWindow({});

var webview = Ti.UI.createWebView({url:"https://dl.dropboxusercontent.com/u/19361741/lineapp/index.html"});
win.add(webview);

win.open();

alert("Hello World from titanium!");
