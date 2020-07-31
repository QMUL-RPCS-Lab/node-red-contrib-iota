const IOTA = require('@iota/core');
const { isTag } = require('@iota/validators');

module.exports = function(RED) {
    function iotasearch(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node._sec = 2;
	      node._firstroot = '';
        var iota_value = '';
        this.iotaNode = RED.nodes.getNode(config.iotaNode);

        const iota = new IOTA({'host': this.iotaNode.host, 'port': this.iotaNode.port});
        node.readyIota = true;

        node.on('input', function(msg) {
            if (this.readyIota) {
              console.log("Searching dataset via findTransactionObjects.")
              this.readyIota = false;
              var self = this;
              this.status({fill:"red",shape:"ring",text:"connecting"});

              iota_value = config.iotaValue;

              var objeto;
              switch (config.iotaSelect){
                case 'addresses':
                        if (iota.valid.isAddress(msg.payload)) {
                          iota_value = msg.payload;
                          //console.log("searching address: "+iota_value);
                        }
                        objeto = {addresses:[iota_value]};
                        break;
                case 'bundles':
                        if (iota.utils.isBundle(msg.payload)) {
                          iota_value = msg.payload;
                          //console.log("searching bundle... : "+iota_value);
                        }
                        objeto = {bundles:[iota_value]};
                        break;
                case 'tags':
                        if (isTag(msg.payload)) {
                          iota_value = msg.payload;
                          //console.log("searching tag: "+iota_value);
                        }
                        objeto = {tags:[iota_value]};
                        break;
                case 'approvees':
                        objeto = {approvees:[iota_value]};
                        break;
                }

                console.log(objeto);
                iota.api.findTransactionObjects(objeto, (error, success) => {
                  //console.log("Report from iota node:");
                  this.status({});
                  if (error) {
                     console.log(error);
                     msg.payload=error;
                     self.send(msg);
                  } else {
                     console.log(success);
                     msg.payload=success;
                     self.send(msg);
                  }
                });
            }
        });
    }
    RED.nodes.registerType("iotasearch",iotasearch);
}
