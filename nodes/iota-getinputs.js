const IOTA = require('@iota/core');

module.exports = function (RED) {
  function iotagetinputs(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var iota_seed = '';

    node._sec = 2;
    node._firstroot = '';
    this.iotaNode = RED.nodes.getNode(config.iotaNode);
    //console.log("Iota Api getinputs: " + this.iotaNode.host + ":" + this.iotaNode.port);
    const iota = new IOTA({ 'host': this.iotaNode.host, 'port': this.iotaNode.port });
    node.readyIota = true;

    node.on('input', function (msg) {
      if (this.readyIota) {
        console.log("Get account dataset via getInputs.");
        if (iota.valid.isTrytes(msg.payload, 81)) {
          iota_seed = msg.payload;
        } else {
          iota_seed = config.iotaSeed; //'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD'
        }
        this.readyIota = false;
        var self = this;
        this.status({ fill: "red", shape: "ring", text: "connecting" });
        iota.api.getInputs(iota_seed, (error, success) => {
          //console.log("Report from iota node:")
          if (error) {
            console.log(error);
            msg.payload = error;
            self.send(msg);
          } else {
            console.log(success);
            msg.payload = success;
            self.send(msg);
          }
          this.status({});
          self.readyIota = true;
        });
      }
    });
  }
  RED.nodes.registerType("iotagetinputs", iotagetinputs);
}
