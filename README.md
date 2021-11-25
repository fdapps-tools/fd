# Node Manager - fdapps-tools

This is main tool for fdapps ecosystem. With this package you can make your nodeJS application be a P2P application, fully descentralized.

Has many work for improve and organize this package, for now it is really messy but works.

For understand better this, can you see: [Backend - fdApps](https://github.com/fdapps-tools/backend)
# TODO

* Organize files and directories structures;
* Make clear tasks needed in each method;
* Write a good readme for this;
* Write jest tests;

## Responsabilities

* Storage Node Informations;
* Communication between nodes;
* Consensous algorithm;
* Route Injection on backend application.

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
