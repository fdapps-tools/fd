# Node Manager - fdapps-tools

This is main tool for fdapps ecosystem. With this package you can make your nodeJS application be a P2P application, fully descentralized.

Has many work for improve and organize this package, for now it is really messy but works.

For understand better this, can you see: [Backend - fdApps](https://github.com/fdapps-tools/backend)
# TODO

* Improve tests coverage;
* Organize files and directories structures;
* Make clear tasks needed in each method;
* Write a good readme for this;

## Responsabilities

* Storage Node Informations;
* Communication between nodes;
* Consensous algorithm;
* Route Injection on backend application.
* Tunnel -> Old Tunnel Repo

# Tunneling

Warning: Do not use this pack in production projects! This package is under construction to serve the fdapps ecosystem (which is also under construction).

The purpose of this repository is to abstract the creation of a tunnel for the ecosystem.

Initially we are using 'localtunnel' to create the tunnel. This allows us to create access to a local application in a simple and practical way.

We will need to create a resource that is not tied to any external server as it is today, as our project consists of a completely P2P ecosystem.

I intend to program this package in Rust, however it will have to be consumed by the main application written in NodeJs.

There are some technical challenges regarding this package, the main one is the creation of a direct P2P tunnel, for this it is necessary to study some network concepts as we will need to drill an existing connection to create the socket between two residential hosts.

The main project is complex, I'm separating some responsibilities into smaller packages (like this one) but the basic principle is the functionality of the ecosystem as a whole, so this package can change according to the needs of the ecosystem.

## TODO TUNNEL

1. Explain about how to works actually 
2. Write documentation about limitations with localtunnel and to remove complexity


### OLD TUNNEL README 

Isso foi um desafio no primeiro momento, vou descrever o que compreendi até o momento, posso estar errado mas resolvi temporariamente.

Quando batemos em uma porta de IP publico de um provedor de internet, o roteador não possui rotas para saber para ondem redirecionar o acesso, além de possuir portas fechadas.

Não quero incluir a complexidade do usuário ter que fazer configuração em seu equipamento, a solução que encontrei foi com tuneis. Pelo que entendi, o serviço mantém uma conexão como uma VPN com um servidor que faz o proxy do acesso direto pra ele. Isso parece resolver, mas coloca um ponto crítico que é ter a necessidade desse servidor fazer o proxy, tirando parte da descentralização completa, que é meu objetivo.

Uma alternativa funcional por hora, é utilizar um desses serviços (ngrok, localtunnel, etc) de forma escalada, ou seja, ter um conjunto de possibilidades e alternar entre elas.

No momento isso está sendo feito com o localtunnel apenas e funciona, pretendo melhorar essa implementação e modelar para que fique flexível alternar.

De certa forma isso esta 'resolvendo' o DNS também, mas é importante retomar o tópico de DNS no futuro.
----
## OLD README - Need rewrite and translate
### The data State

Remover do gist fez eu perceber que cada nó precisa de uma cópia dos dados da rede, como um estado global.
Por agora, estou guardando jsons no diretório localDB e farei um esquema de broadcast para que todos mantenham-se iguais.
Acredito que isso vá elovuir para uma classe mais completa e posso aproveitar conhecimentos da arquitetura flux de frontend.
Uma classe responsável por entregar os dados do estado global, inserir, remover e atualizar. De forma abstraida para que a mudança de arquivos texto para algum banco de dados sejam menos dolorosa no futuro.

E o detalhe é que só estamos falando do estado da rede em sí, da consistência e confiança dos nós, nada sobre os dados descentralizados para a aplicação de fato.

### Concenso distribuido e garantia entre nós

Como garantir que os nós sejam confiáveis entre sí?

Não estou pensando nos dados ainda, apenas na distribuição da aplicação. O que fará um novo nó ser confiável perante a rede?
Pensando nisso, por que não armazenar às informações de nós localmente em cada nó e, a cada mudança, haja um broadcast para que todos tenham os dados dentro de sí mesmo?

Estou considerando fazer algo neste sentido:

Primeiro nó possui apenas sí próprio na rede.
Quando outro host quiser se tornar um nó, ele vai enviar um pedido de subscrição para o primeiro nó (N1).
N1 recebe o pedido de subscrição assinado com a chave publica do futuro N2 e um hash do seu código atual.
Após a validação (que na próxima vez não pode depender somente do N1), o N1 enviará ao N2 que tudo bem, ele pode ser um nó.
N1 também fará um broadcast para todos com a atualição do novo nó, pois ele é um nó confiável e pode fazer isso.

Somente um nó já validado poderá fazer o broadcast. Broadcast este conterá o registro de aceites dos demais % da rede.

Quando um novo host que vier do código fonte original e não de um nó, quiser entrar para uma rede? Basta ele inicializar-se com o link de algum nó valido. Inclusive isso permitirá até manter um unico nó com um IP fixo para que a rede sempre possa ser reconstituida caso os nós livres saiam.

Esta bem modelado na minha cabeça, parece ser possível com as informações atuais que tenho mas ainda preciso aprender mais para poder simplificar o processo.

Seria legal ter algum esquema de filas tipo zeroMQ, sqs, redis para esse processamento do concenso.


Caso 1: Primeiro nó da rede, não há outro para se referenciar. Começa do zero, se auto define como nó.
Caso 2: Há rede para referenciar definida no ambiente como `NETWORK_NODE_URL`, começa o processo de pedido para ser nó.

* Faz uma requisição para o nó informado;
* Nó inclui a requisição em uma lista para ser validado;
* Cron do nó atribui sua verificação no nó;
* Nó faz broadcast com outros nós para ter mais aprovações;
* Último nó a aprovar, inclui o novo host como nó e informa para os outros.

### Node updates

Caso seja necessário lançar um bugfix na rede ou alguma nova versão, como isso aconteceria?
### Processamento remunerado

É importante pensar nisso mas ainda não sei como um nó pode ter remuneração para manter-se um nó. 
