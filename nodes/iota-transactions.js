const IOTA = require('@iota/core');

module.exports = function (RED) {
  function iotatransactions(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node._sec = 2;
    node._firstroot = '';
    var iota_hash = '';
    this.iotaNode = RED.nodes.getNode(config.iotaNode);
    const iota = new IOTA({ 'host': this.iotaNode.host, 'port': this.iotaNode.port });
    node.readyIota = true;

    node.on('input', function (msg) {
      if (this.readyIota) {
        console.log("Searching dataset via getTransactionsObjects.")
        this.readyIota = false;
        var self = this;
        this.status({ fill: "red", shape: "ring", text: "connecting" });

        if (iota.valid.isHash(msg.payload)) {
          iota_hash = msg.payload;
        } else {
          iota_hash = config.iotaHash;
        }
        console.log("Input HASH: " + iota_hash);
        iota.api.getTransactionsObjects([iota_hash], (error, success) => {
          //console.log("Report from iota node:")
          if (error) {
            console.log(error);
            msg.payload = error;
            self.send(msg);
          } else {
            console.log(success);
            msg.payload = success;
            iota.api.getLatestInclusion([iota_hash], function (err, suc) {
              if (err) {
                console.error(err);
                msg.payload = err;
                self.send(msg);
              } else {
                console.log(suc);
                msg.payload[0].confirmed = suc[0];
                self.send(msg);
              }
            });
          }
          this.status({});
          self.readyIota = true;
        });
      }
    });
  }
  RED.nodes.registerType("iotatransactions", iotatransactions);
}
