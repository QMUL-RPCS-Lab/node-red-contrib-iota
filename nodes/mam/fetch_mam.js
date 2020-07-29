const MAM = require('@iota/mam');
const IOTA_CONVERTER = require('@iota/converter')

module.exports = function (RED) {
  function fetch_ctor(config) {
    RED.nodes.createNode(this, config);
    let node = this;
    let mamState = MAM.init({ provider: config.iotaNode });

    node.status({ fill: "blue", shape: "dot", text: "idle" });

    node.on('input', function (msg, send, done) {
      // For maximum backwards compatibility, check that send exists.
      // If this node is installed in Node-RED 0.x, it will need to
      // fallback to using `node.send`
      send = send || function () { node.send.apply(node, arguments) }

      if (msg.error == null) {
        let root = msg.payload;
        console.log("MAM fetch on iota node: " + config.iotaNode);
        console.log("MAM root: " + config.root);
        console.log("MAM mode: " + config.mode);
        console.log("MAM secret: " + config.secret);
        console.log("Fetching data ... ");

        root = root.slice(0, 81);
        if (config.mode == 'restricted' && config.secret.length == 0) {
          console.log("Restricted mode: No MAM secret selected");
        }
        if (config.mode == 'public') {
          config.secret = null;
        }
        node.status({ fill: "yellow", shape: "dot", text: "fetching" });
        let resp = MAM.fetch(root, config.mode, config.secret, (result) => {
          let jsonArray = JSON.parse(IOTA_CONVERTER.trytesToAscii(result));
          console.log(jsonArray)
          msg.payload = jsonArray;
          send(msg);
          node.status({ fill: "green", shape: "dot", text: "fetched" });
        }, config.limit);
      }
      if (done) {
        done();
      }
    });
  }
  RED.nodes.registerType("MAM fetch", fetch_ctor);
}
