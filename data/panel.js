function setUserName(json) {
    console.log(json);
}

self.port.on("userName", setUserName);
