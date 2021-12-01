# Tunneling

This module solves application delivery in home environments, where router ports are not automatically forwarded. Despite being seen as direct P2P, we are still making use of a cloud feature called localtunnel (like ngrok) to provide us with name resolution and forwarding from port 443 to the service port running locally.

There are complexities to be resolved in relation to this, for example, what is the best way to establish a direct connection between the domestic ones, without the need to maintain an active connection with the local tunnel server?

I know that there are packages in NodeJS that solve this in relation to piercing the already established HTTP package, in order to establish the connection with home networks.

In theory, even after we resolve the scenario regarding DNS delivery and the tunnel itself, the functioning of the rest of the application will not suffer drastically, for this reason I preferred to continue with the overall project and keep it functioning with dependence on local tunnel for now.

If you are an expert in networking and can contribute, you will be very welcome.