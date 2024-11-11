
<h1 align="center" style="font-weight: bold;"> Automação de Preços na Gamivo 💻</h1>

<p align="center">
 <a href="#about">Problema e contextualização</a> • 
 <a href="#technologies">Tecnologias utilizadas</a> • 
  <a href="#started">Como executar</a> •
  <a href="#routes">API's utilizadas</a> •
</p>

<p align="center">
    <b>Script para deixar os preços na venda de jogos sempre o mais baixo possível.</b>
</p>


<h2 id="about"> Problema e contextualização </h2>

### Imagine-se na seguinte situação 
Você anuncia mais de 200 jogos em um marketplace(https://www.gamivo.com/) e para vender o jogo mais rapidamente, você deve mantê-lo com o menor preço, ou seja, o mais baixo. Porém, sempre que você abaixa o preço, alguém logo em seguida coloca o preço 1 centavo mais baixo que você, vendendo o jogo no seu lugar. Como manter 200 jogos sempre com o preço mais baixo sem ficar o dia inteiro só fazendo isso?

### Solução
Criar uma API que se comunica com a Gamivo para comparar e atualizar o preço de TODOS os jogos várias vezes ao dia, de forma automatizada.

### Resultado
O resultado será que todos os jogos já listados a venda terão os seus preços SEMPRE competitivos, respeitando as regras de venda, como por exemplo identificar preços muito abaixo e identificar quando estamos competindo com outro vendedor que também automatiza os seus preços. Portanto, com esta API o vendedor terá menos trabalho para ficar alterando o preço dos jogos e também terá mais lucro, já que terá o preço mais competitivo.


<h2 id="technologies">💻 Stack utilizada</h2>

Recursos utilizados para desenvolver o projeto:
- **Node.js** - Ambiente de execução JavaScript fora do navegador, essencial para o desenvolvimento de aplicações de servidor e para rodar o projeto de maneira eficiente no backend.
- **Typescript** - Superset do JavaScript que adiciona tipagem estática, permitindo maior segurança, detecção de erros em tempo de desenvolvimento e melhor estruturação do código.
- **Axios** - Biblioteca baseada em promises para realizar requisições HTTP, facilitando a comunicação com APIs externas de forma rápida e eficiente.

<h2 id="started">🚀 Primeiros passos</h2>

<h3>Pré-requisitos</h3>

- [NodeJS](https://nodejs.org/en/download/prebuilt-installer)  


### Como executar:
```sh
git clone https://github.com/JoaoVitor2310/gamivo-carca-deals # Clonar o repositório
cd gamivo-carca-deals # Entrar no diretório do projeto
npm install # Instalar as dependências
npm run dev # Executar o projeto em modo de desenvolvimento
npm start # Executar o projeto em modo produção
```

### Deploy:
Foi realizado deploy dessa API em uma VPS no seguinte endereço: http://191.101.70.89:3001/

<h2 id="routes">📍 API's Utilizadas</h2>

<h3> API Gamivo</h3>
- https://www.gamivo.com/api-documentation/public   

API fornecida pela GAMIVO para seus vendedores e clientes. Toda a documentação das rotas utilizadas está no link acima.
