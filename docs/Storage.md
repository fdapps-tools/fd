# Storage

The storage of the information related to the configurations of the nodes for now is being carried out in files with data recorded in JSON format. Something very simple, where each node has a small set of files and some actions trigger the broadcast so that everyone gets an updated copy.

This package does not deal with the storage of business data in a distributed way yet, only with respect to node configurations.

For example:

1. Active nodes;
2. Nodes under approval

I don't want it to stay that way, I think it's better that we get some real database feature that's simple and secure. And we also need to study about a good way for the data to be distributed in a secure way. For that we'll get into something about blockchain, even so that the consensus between the approval of new nodes is carried out properly.

I think we can try to do something using blockchain like BSC or ethereum in the future. But for now, I'm more concerned with making the starter tools very functional and secure.
