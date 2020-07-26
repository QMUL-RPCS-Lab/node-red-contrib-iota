# Node-red IOTA MAM module

Updated on 18/04/2019

## Requirements

Install node-red globally and install ui packages and the sensortag package

```
sudo npm install -g --unsafe-perm node-red
```

in your ~/.node-red installation directory type:
```
npm install node-red-dashboard node-red-contrib-sensortag node-red-contrib-simple-gate

```

# IOTA-MAM module installation

Run the following command in your NODE-RED install
```
npm install node-red-contrib-iota-mam
```

# Usage

Two different function nodes are now available for

**MAM publish** (=upload data to tangle)
and
**MAM fetch** (=download data from tangle)

Drag MAM function node into a flow and wire it accordingly

## CONFIG - At first use the Node-red sample file included !!!

Find included in the root directory a flow sample file called flows_Air.json
It provides you with an initial config for ROOT (mamFetch) and a devnet IOTA node.

Also you can switch to the newly added node-red dashboard to publish/fetch data
and see a live visualization.

If you have any issues regarding this module, please test with this file and give a clear issue description. Thank you!

## MAM fetch

Start deploying a single 'mamFetch function node'.
Set its root property (**root = "your MAM_ROOT"**)

wire this node's output to
-> any output ( e.g. a chart displaying your msg.payload)

> try with NHNRYMKA9RLTPLQNWFRHKJGVUXAAPBVYBG9LOXFPKDWVKOUIDILEVCBNGLOPYZEGZMEFSCOOVCKNOPSNB)

This should hold a non-encrypted (public) data packet sequence. (as of 18 april 2019)


## MAM publish

Deploy a sensorTag as input data source.
(Please report an issue https://gitlab.com/ouya/node-red-contrib-iota-mam/issues if you encounter problems with other sensors. We are looking to support all general sensors in the near future)

wire its output to
-> mamPublish node

and wire this node's output to an
-> (optional) output for logging

The MAM publish now operates in a loop:

1)  collects input data from sensorTag (can be a mix of temperature, lux etc)
2)  and immediately uploads the 1st data packet to the tangle

loop:
  ... now waiting for the bundle and its transactions to be confirmed on the tangle, it aggregates all incoming sensor tag data into a data array ...
  upon MAM confirmation of the previous bundle, it sends this aggregated data array to the tangle
  ... now waiting again for bundle confirmation

### Rate limits
on many public nodes you might have rate limits, so better use your own custom node, or make sure the node you connect to has the capacity to handle your sensor data traffic.
