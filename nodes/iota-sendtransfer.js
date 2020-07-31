const IOTA = require('@iota/core');

module.exports = function (RED) {
  function iotasendtransfer(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node._sec = 2;
    node._firstroot = '';
    this.iotaNode = RED.nodes.getNode(config.iotaNode);
    const iota = new IOTA({ 'host': this.iotaNode.host, 'port': this.iotaNode.port });
    node.readyIota = true;

    node.on('input', function (msg) {
      if (this.readyIota) {
        console.log("Uploading dataset via sendTransfer.")
        let txt = JSON.stringify(msg.payload);
        let ascii = TRAN.transliterate(txt);
        let trytes = iota.utils.toTrytes(ascii);

        let txttag = JSON.stringify(config.iotaTag);
        let asciitag = TRAN.transliterate(txttag);
        let trytestag = iota.utils.toTrytes(asciitag);

        console.log("message payload: " + msg.payload)
        console.log("transliterated: " + ascii)
        console.log("trytes: " + trytes)

        const iota_addr = config.iotaAddr; //'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD'
        const iota_seed = config.iotaSeed; //'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD'

        let iota_value = iota.utils.convertUnits(config.iotaValue, "Ki", "i");
        console.log("sending founds: " + iota_value + " i" + " in TAG: " + trytestag);
        const transfers = [{
          'value': iota_value,
          'address': iota_addr,
          'message': trytes,
          'tag': trytestag
        }]
        this.readyIota = false;
        this.status({ fill: "red", shape: "ring", text: "connecting" });
        var self = this;
        iota.api.sendTransfer(iota_seed, 4, 14, transfers, (error, success) => {
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
  RED.nodes.registerType("iotasendtransfer", iotasendtransfer);
}
