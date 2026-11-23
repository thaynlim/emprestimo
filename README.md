💜 #Elas Tech | Sistema de Empréstimo de Equipamentos

Aplicação web desenvolvida como Projeto 2 do curso Elas Tech para gerenciar equipamentos corporativos, colaboradores e empréstimos.

O sistema substitui controles manuais por um painel integrado a uma API REST, com registro de devoluções, histórico, regras de negócio e autenticação.

✨ Funcionalidades

📊 Dashboard web: indicadores e navegação pelas áreas do sistema.

💻 Equipamentos: cadastro, listagem, busca, edição, exclusão e filtros por tipo e disponibilidade.

👥 Colaboradores: cadastro, consulta e histórico individual de empréstimos.

🔄 Empréstimos: registro, acompanhamento, devolução e consulta de atrasos.

🔐 Autenticação JWT: acesso com perfis ADMIN e COLABORADOR.

🎨 Interface web: desenvolvida com HTML, CSS e JavaScript, incluindo pesquisa, filtros e alternância entre tema claro e escuro.

📖 Swagger UI: documentação interativa dos endpoints da API.

🛠️ Tecnologias utilizadas

Camada

Tecnologias

☕ Backend

Java 25, Spring Boot e Spring Web

🗄️ Persistência

Spring Data JPA, Hibernate e H2

🔐 Segurança

Spring Security, JWT e BCrypt

✅ Validação

Jakarta Bean Validation

🎨 Frontend

HTML5, CSS3 e JavaScript

📖 Documentação

Swagger / OpenAPI

🧪 Testes

JUnit 5 e Postman

🐳 Implantação

Docker e Render

📦 Dependências

Maven

🏗️ Arquitetura do projeto

O backend foi organizado em camadas para separar responsabilidades e facilitar a manutenção.

Controller: recebe as requisições HTTP e disponibiliza os endpoints REST.

Service: concentra as regras de negócio.

Repository: realiza o acesso ao banco de dados.

Model: representa as entidades do sistema.

DTO: transporta dados entre as camadas.

Security: gerencia autenticação, tokens JWT e autorização.

Exception: trata situações de erro da aplicação.

As principais entidades são Equipamento, Colaborador e Emprestimo.

Os empréstimos possuem relacionamentos JPA @ManyToOne com equipamentos e colaboradores.

A interface web está localizada em src/main/resources/static.

📋 Regras de negócio — R1 a R10

Regra

Descrição

R1

Não permite cadastrar equipamentos com patrimônio duplicado.

R2

Todo equipamento é cadastrado inicialmente como disponível.

R3

Não permite cadastrar colaboradores com e-mail duplicado.

R4

Só permite emprestar equipamentos disponíveis.

R5

Ao registrar um empréstimo, o equipamento fica indisponível, a data inicial é a atual e o prazo previsto é de 14 dias.

R6

Não permite devolver duas vezes o mesmo empréstimo.

R7

Ao devolver, registra a data atual e torna o equipamento disponível novamente.

R8

Considera atrasado o empréstimo não devolvido cuja data prevista já passou.

R9

Impede a exclusão de equipamentos que possuem histórico de empréstimos.

R10

Impede novos empréstimos para colaboradores com empréstimos atrasados e não devolvidos.

As regras são aplicadas nas entidades e nos serviços, conforme a necessidade de consulta ao banco de dados.

🌐 Endpoints da API

URL-base local: http://localhost:8080

🔑 Autenticação

Método

Endpoint

Descrição

POST

/auth/login

Autentica um usuário e retorna um token JWT.

💻 Equipamentos

Método

Endpoint

Descrição

GET

/equipamentos

Lista equipamentos, com filtros opcionais de tipo e disponibilidade.

GET

/equipamentos/{id}

Consulta um equipamento pelo ID.

POST

/equipamentos

Cadastra um equipamento.

PUT

/equipamentos/{id}

Atualiza um equipamento.

DELETE

/equipamentos/{id}

Exclui um equipamento, respeitando as regras de negócio.

👥 Colaboradores

Método

Endpoint

Descrição

GET

/colaboradores

Lista colaboradores.

GET

/colaboradores/{id}

Consulta um colaborador pelo ID.

POST

/colaboradores

Cadastra um colaborador.

GET

/colaboradores/{id}/emprestimos

Consulta o histórico de empréstimos de um colaborador.

🔄 Empréstimos

Método

Endpoint

Descrição

GET

/emprestimos

Lista empréstimos, permitindo filtrar os atrasados.

GET

/emprestimos/{id}

Consulta um empréstimo pelo ID.

POST

/emprestimos?equipamentoId=1&colaboradorId=1

Registra um empréstimo.

PUT

/emprestimos/{id}/devolucao

Registra a devolução de um equipamento.

Total: 14 endpoints principais, distribuídos entre quatro controllers.

🔐 Autenticação e autorização

O projeto utiliza Spring Security e JWT (JSON Web Token).

O usuário realiza o login e recebe um token que deve ser enviado nas requisições protegidas.

Exemplo de login

Endpoint: POST /auth/login

{
  "usuario": "admin",
  "senha": "admin123"
}

Utilização do token

Authorization: Bearer SEU_TOKEN

👤 Usuários de demonstração

Usuário

Senha

Perfil

admin

admin123

ADMIN

colaborador

colab123

COLABORADOR

As credenciais são utilizadas exclusivamente para demonstração e testes.

As permissões são controladas por perfil. O registro de empréstimos e devoluções permite os dois perfis; as demais operações de alteração são restritas ao administrador.

Observação de segurança: em uma publicação pública, as credenciais demonstrativas não devem proteger informações sensíveis. A chave JWT de produção deve ser configurada por variável de ambiente.

🚀 Como executar o projeto localmente

📌 Pré-requisitos

JDK 25.

IntelliJ IDEA ou outra IDE compatível.

Maven ou Maven Wrapper.

Passo a passo

Clone o repositório ou abra a pasta do projeto no IntelliJ.

Aguarde o Maven carregar as dependências.

Execute a classe EmprestimoApplication.

Aguarde a inicialização do Spring Boot.

Acesse a aplicação pelo navegador:

http://localhost:8080/

Também é possível executar pelo terminal.

Linux/macOS:

./mvnw spring-boot:run

Windows:

mvnw.cmd spring-boot:run

🗄️ Banco de dados

O sistema utiliza o banco H2 com armazenamento em arquivo local.

Configuração:

spring.datasource.url=jdbc:h2:file:./dados/emprestimos
spring.jpa.hibernate.ddl-auto=update

O banco armazena informações de equipamentos, colaboradores e empréstimos.

A pasta dados/ e os arquivos do banco estão configurados para não serem enviados ao GitHub.

O console H2 fica desabilitado por padrão e pode ser habilitado em ambiente local com a variável:

SPRING_H2_CONSOLE_ENABLED=true

📖 Swagger / OpenAPI

O projeto possui documentação interativa da API utilizando Swagger.

Com a aplicação em execução, acesse:

http://localhost:8080/swagger-ui/index.html

A documentação apresenta os quatro controllers principais:

equipamento-controller

emprestimo-controller

colaborador-controller

auth-controller

🧪 Testes

O projeto possui testes automatizados utilizando JUnit 5.

Na última execução local, 17 testes foram aprovados.

Também foram realizados testes manuais de API utilizando Postman, contemplando os cenários previstos no projeto.

Entre as validações estão:

Cadastro de equipamentos e colaboradores.

Impedimento de patrimônios duplicados.

Impedimento de e-mails duplicados.

Empréstimo de equipamento disponível.

Bloqueio de empréstimo de equipamento indisponível.

Registro de devoluções.

Impedimento de devolução duplicada.

Consulta de empréstimos atrasados.

Histórico de empréstimos por colaborador.

Bloqueio de exclusão de equipamento com histórico.

Bloqueio de novos empréstimos para colaboradores com atrasos.

▶️ Executar os testes

Linux/macOS:

./mvnw test

Windows:

mvnw.cmd test

🌟 Funcionalidades extras e bônus implementados

Além dos requisitos principais, foram implementados recursos adicionais para ampliar a experiência e a organização do sistema.

📖 Swagger / OpenAPI

Documentação interativa dos endpoints REST, facilitando a consulta e os testes da API.

✅ Validação de dados

Utilização de validações para impedir o recebimento de informações inválidas, incluindo anotações como @NotBlank, @NotNull, @Email e @Valid.

⚠️ Tratamento de exceções

Tratamento de erros de negócio e situações como recursos não encontrados, conflitos e operações não permitidas.

🔗 Relacionamentos JPA

Associações @ManyToOne entre empréstimos, equipamentos e colaboradores.

🔐 Segurança JWT

Autenticação por token, filtro de requisições e autorização baseada em perfis.

🎨 Interface web integrada

Frontend desenvolvido com HTML, CSS e JavaScript, permitindo utilizar as principais funcionalidades sem depender exclusivamente do Postman.

📊 Dashboard

Painel visual com informações do sistema, navegação, pesquisa e alternância entre temas claro e escuro.

🐳 Docker

O projeto possui um Dockerfile com construção em múltiplas etapas (multi-stage build).

A primeira etapa utiliza Maven e Java 25 para compilar a aplicação.

A segunda utiliza o ambiente de execução Java 25 para iniciar o arquivo .jar.

A aplicação utiliza a porta 8080, podendo receber outra porta por variável de ambiente.

☁️ Publicação no Render

O projeto está preparado para publicação no Render utilizando Docker.

A configuração permite utilizar variáveis de ambiente:

server.port=${PORT:8080}
spring.h2.console.enabled=${SPRING_H2_CONSOLE_ENABLED:false}
jwt.segredo=${JWT_SEGREDO:minha-chave-secreta-jwt-com-mais-de-32-caracteres}

💾 Observação sobre persistência

O banco H2 em arquivo é adequado para desenvolvimento e demonstração.

No Render, os arquivos locais podem ser perdidos após reinicializações ou novas implantações. Para uma aplicação de produção com persistência duradoura, recomenda-se utilizar um banco de dados externo.

💜 Sobre o projeto

O objetivo é aplicar os conhecimentos de Java, orientação a objetos, Spring Boot, APIs REST, persistência de dados, regras de negócio, testes automatizados, segurança e publicação de aplicações web.

💜 #Elas Tech — Sistema de Empréstimo de Equipamentos.