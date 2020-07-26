const MAM = require('@iota/mam');
const IOTA_CONVERTER = require('@iota/converter');

module.exports = function (RED) {
    function publish_ctor(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        console.log("MAM publish INIT on iota node: " + config.iotaNode);
        node._state = MAM.init({ provider: config.iotaNode });
        node._state = MAM.changeMode(node._state, config.mode, config.secretKey);
        node.readyMAM = true;
        node.arrayPackets = []
        node.status({ fill: "blue", shape: "dot", text: "idle" });

        node.on('input', function (msg, send, done) {
            // For maximum backwards compatibility, check that send exists.
            // If this node is installed in Node-RED 0.x, it will need to
            // fallback to using `node.send`
            send = send || function () { node.send.apply(node, arguments) }

            const packet = { time: Date.now(), data: msg.payload };
            node.arrayPackets.push(packet);
            console.log(this.arrayPackets.length);

            if (node.readyMAM) {
                let trytes = IOTA_CONVERTER.asciiToTrytes(JSON.stringify(node.arrayPackets));
                let message = MAM.create(node._state, trytes);
                // Update the mam state so we can keep adding messages.
                this._state = message.state;

                console.log("Uploading dataset via MAM - please wait");
                console.log(message.address);
                node.status({ fill: "yellow", shape: "dot", text: "publishing" });
                let resp = MAM.attach(message.payload, message.address, 3, 10);
                node.readyMAM = false;
                node.arrayPackets = [];
                resp.then(
                    // success
                    function (result) {
                        console.log(result)
                        node.readyMAM = true;
                        msg.payload = message.address;
                        send(msg);
                        node.status({ fill: "green", shape: "dot", text: "published" });
                    },
                    // failure
                    function (result) {
                        console.log("Error " + result)
                        node.readyMAM = true;
                        msg.payload = message.address;
                        send(msg);
                        node.status({ fill: "red", shape: "ring", text: "error" });
                    });
            } else {

            }
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType("MAM publish", publish_ctor);
}