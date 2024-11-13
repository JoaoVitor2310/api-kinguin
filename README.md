<h1 align="center" style="font-weight: bold;"> Automação de Preços na Gamivo 💻</h1>

<p align="center">
 <a href="#problema-e-contextualizacao">Problema e Contextualização</a> • 
 <a href="#tecnologias-utilizadas">Tecnologias Utilizadas</a> • 
 <a href="#primeiros-passos">Como Executar</a> •
 <a href="#apis-utilizadas">APIs Utilizadas</a> 
</p>

**Script para manter os preços dos jogos sempre o mais competitivo possível.**

---

## 📝 Problema e Contextualização

### Cenário:
Imagine a seguinte situação: você tem mais de 200 jogos listados no marketplace [Gamivo](https://www.gamivo.com/), e deseja acelerar as vendas mantendo o menor preço. No entanto, sempre que você reduz o valor, outro vendedor logo coloca o preço 1 centavo abaixo, levando a venda no seu lugar. Como manter os preços dos 200 jogos sempre atualizados sem precisar monitorá-los manualmente o tempo todo?

### Solução:
A solução é uma API automatizada que se conecta à Gamivo, compara os preços de todos os jogos e ajusta automaticamente o valor para mantê-los competitivos. Esse processo é realizado várias vezes ao dia, permitindo que os preços se adaptem constantemente ao mercado.

### Resultado:
Com essa API, os jogos estarão sempre com preços competitivos, respeitando as regras do marketplace e monitorando para evitar valores muito abaixo do esperado. Essa automação reduz o trabalho manual e potencializa o lucro, já que os jogos estarão sempre no topo da competitividade de preços.

---

## 💻 Tecnologias Utilizadas

O projeto foi desenvolvido utilizando:

- **Node.js**: Ambiente de execução JavaScript para backend, ideal para o desenvolvimento de APIs escaláveis e rápidas.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática, garantindo maior segurança no desenvolvimento e facilitando a manutenção do código.
- **Axios**: Biblioteca para realizar requisições HTTP, essencial para comunicação com APIs externas de forma simples e eficiente.

---

## 🚀 Primeiros Passos

### Pré-requisitos:
- [NodeJS](https://nodejs.org/en/download/) deve estar instalado.

### Como executar:
```bash
# Clone o repositório
git clone https://github.com/JoaoVitor2310/gamivo-carca-deals

# Navegue até o diretório do projeto
cd gamivo-carca-deals

# Instale as dependências
npm install

# Execute o projeto em modo de desenvolvimento
npm run dev

# Para executar em modo de produção
npm start
```

### Deploy:
A API está hospedada em uma VPS e pode ser acessada pelo endereço: http://191.101.70.89:3001/

<h2 id="routes">📍 API's Utilizadas</h2>

<h3> Gamivo API</h3>
- Documentação: https://www.gamivo.com/api-documentation/public   

A Gamivo fornece essa API pública para seus vendedores e clientes. A documentação completa das rotas está disponível no link acima, detalhando as chamadas necessárias para gerenciar os preços dos produtos.
