const IOTA = require('@iota/core');

module.exports = function (RED) {
  function iotanewaddress(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node._sec = 2;
    node._firstroot = '';
    var iota_seed = '';
    var iota_Security = 2;
    this.iotaNode = RED.nodes.getNode(config.iotaNode);
    const iota = new IOTA({ 'host': this.iotaNode.host, 'port': this.iotaNode.port });
    node.readyIota = true;

    node.on('input', function (msg) {
      if (this.readyIota) {
        console.log("Get new address...")
        iota_Security = config.iotaSecurity;
        //console.log(iota_Security);
        if (iota.valid.isAddress(msg.payload)) {
          iota_seed = msg.payload;
        } else {
          iota_seed = config.iotaSeed; //'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD'
        }
        this.readyIota = false;
        var self = this;
        this.status({ fill: "red", shape: "ring", text: "connecting" });
        iota.api.getNewAddress(iota_seed, { index: 0, total: 1, security: parseInt(iota_Security), checksum: true }, (error, success) => {
          //console.log("Report from iota node:")
          if (error) {
            console.log(error);
            msg.payload = error;
            self.send(msg);
          } else {
            console.log(success);
            msg.output = success;
            msg.payload = success[0];
            self.send(msg);
          }
          this.status({});
          self.readyIota = true;
        });
      }
    });
  }
  RED.nodes.registerType("iotanewaddress", iotanewaddress);
}
