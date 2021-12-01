# Distributed consent and guarantee between us

How to ensure that nodes are trusted with each other?

I'm not thinking about the data yet, just the application distribution. What will make a new node be trusted by the network?
With that in mind, why not store the node information locally on each node and, with each change, there is a broadcast so that everyone has the data inside themselves?

I'm considering doing something along these lines:

First node has only itself on the network.
When another host wants to become a node, it will send a subscription request to the first node (N1).
N1 receives the subscription request signed with the public key of the future N2 and a hash of its current code.
After validation (which next time can't just depend on N1), N1 will send N2 that okay, it can be a node.
N1 will also broadcast to everyone the update of the new node as it is a trusted node and can do this.

Only an already validated node will be able to broadcast. Broadcast this will contain the record of acceptances of the remaining % of the network.

When a new host that comes from the original source code and not a node wants to join a network? It only needs to be initialized with the link of some valid node. This will even allow you to maintain a single node with a fixed IP so that the network can always be reconstituted if the free nodes leave.

It's well modeled in my head, it seems to be possible with the current information I have but I still need to learn more in order to simplify the process.

It would be nice to have some zeroMQ, sqs, redis type queuing scheme for this consensus processing.

Case 1: First node in the network, there is no other to reference. It starts from scratch, defines itself as a node.
Case 2: There is network to reference defined in the environment as `NETWORK_NODE_URL`, starts the process of requesting to be node.

* Makes a request to the informed node;
* Node includes the request in a list to be validated;
* Node cron assigns its verification on the node;
* Node broadcasts with other nodes to get more approvals;
* Last node to approve, adds the new host as a node and informs others.