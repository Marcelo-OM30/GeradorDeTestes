# Gerador Avançado de Casos de Teste

Este projeto é uma ferramenta web para gerar casos de teste de forma combinatória e baseada em regras, utilizando o formato Gherkin para a saída. Ele permite definir campos de entrada, seus possíveis valores (incluindo classes de equivalência e valores limite), e regras lógicas para determinar o resultado esperado de cada combinação.

## Funcionalidades

*   Definição dinâmica de campos de entrada.
*   Geração automática de valores de teste com base em classes de equivalência (vazio, texto longo, caracteres especiais, numéricos) e exemplos fornecidos pelo usuário.
*   Motor de regras para definir resultados esperados com base em múltiplas condições.
*   Geração de casos de teste em formato Gherkin (Dado, Quando, Então).
*   Exportação dos casos de teste gerados para um arquivo Excel.

## Como Usar

A interface do gerador é dividida em seções para facilitar a definição dos seus testes:

### 1. Definir Campos de Entrada

Nesta seção, você define os campos que farão parte das entradas dos seus casos de teste.

*   **Adicionar Campo de Entrada:** Clique neste botão para adicionar um novo bloco de definição de campo.
*   Para cada campo adicionado:
    *   **Nome do Campo:** Dê um nome descritivo para o campo (ex: `NomeUsuario`, `ValorCompra`, `TipoDocumento`). Este nome será usado nas regras e na saída dos casos de teste.
    *   **Seus Exemplos de Valores (um por linha):** Aqui você pode fornecer exemplos de valores que este campo pode assumir.
        *   O sistema usará esses exemplos para gerar combinações.
        *   Além dos seus exemplos, o sistema automaticamente adicionará valores representativos de classes de equivalência comuns para garantir uma cobertura mais ampla, como:
            *   `[VAZIO_PLACEHOLDER]` (para representar um valor nulo ou vazio)
            *   `[TEXTO_MUITO_LONGO_ABC...XYZ123...]`
            *   `[!@#$%^&*()]` (caracteres especiais)
            *   Valores numéricos típicos (0, -1, 999999) se o nome do campo sugerir natureza numérica (ex: "valor", "id", "quantidade") ou se seus exemplos forem todos numéricos.
            *   `[NAO_NUMERICO]` se o campo parecer numérico mas você quiser testar uma entrada não numérica.
        *   Se você fornecer exemplos, o sistema tentará inferir o tipo de dado e pode complementar com menos placeholders automáticos se seus exemplos já cobrirem certas classes.
    *   **Remover Campo:** Remove o bloco de definição do campo.

### 2. Definir Regras de Teste (Avaliadas na Ordem)

Aqui você define a lógica que determinará o resultado esperado ("Então") para diferentes combinações dos valores de entrada. As regras são avaliadas na ordem em que aparecem na tela. A primeira regra cujas condições forem completamente satisfeitas determinará o resultado para aquele caso de teste específico.

*   **Adicionar Regra de Teste:** Clique para adicionar um novo bloco de regra.
*   Para cada regra:
    *   **Condições da Regra:**
        *   Uma regra pode ter uma ou mais condições. **Todas as condições dentro de uma regra devem ser verdadeiras** para que a regra seja aplicada e seu "Então Resultado" seja usado.
        *   **Adicionar Condição à Regra:** Clique para adicionar uma nova linha de condição à regra atual.
        *   Para cada condição:
            *   **Campo:** Selecione um dos "Nomes de Campo" que você definiu na Seção 1.
            *   **Operador:** Escolha o operador lógico para a comparação (ex: "Texto é Igual a", "Número >", "Comprimento do Texto >=", "Está Vazio/Nulo").
            *   **Valor de Referência:** O valor com o qual o campo selecionado será comparado usando o operador.
                *   Para operadores de comprimento (ex: "Comprimento do Texto >="), este valor deve ser um número. Se não for um número, a condição será avaliada como falsa.
                *   Para o operador "Está Vazio/Nulo", o "Valor de Referência" é ignorado.
            *   **X (Remover Condição):** Remove a linha da condição.
    *   **Então Resultado =:** Defina o texto que aparecerá na cláusula "Então" do Gherkin se esta regra for aplicada. (Ex: "Login realizado com sucesso", "Mensagem de erro X exibida").
    *   **Remover Regra de Teste:** Remove todo o bloco da regra.

*   **Resultado Padrão Global (se nenhuma regra corresponder):**
    *   Este é o resultado que será usado para um caso de teste se NENHUMA das regras que você definiu for satisfeita pelas entradas daquele caso de teste. É um fallback. (Ex: "Comportamento inesperado", "Erro Genérico").

### 3. Gerar Casos de Teste

*   **Gerar Casos de Teste (Botão):** Após definir seus campos e regras, clique neste botão.
    *   O sistema irá:
        1.  Coletar todos os valores de teste para cada campo (seus exemplos + valores automáticos).
        2.  Gerar todas as combinações possíveis desses valores (produto cartesiano).
        3.  Para cada combinação (caso de teste):
            *   Avaliar as regras na ordem definida.
            *   A primeira regra cujas condições forem todas verdadeiras para a combinação atual determinará o "Então (Resultado Esperado)".
            *   Se nenhuma regra for satisfeita, o "Resultado Padrão Global" será usado.
        4.  Exibir os casos de teste gerados na tabela.

### 4. Casos de Teste Gerados (Formato Gherkin)

Uma tabela exibirá os casos de teste. Cada linha representa um caso de teste com as seguintes colunas:

*   **ID:** Identificador único do caso de teste.
*   **Cenário de Teste:** Um título descritivo para o cenário, geralmente incluindo os valores dos campos de entrada.
*   **Dado (Entradas):** A cláusula "Dado" do Gherkin, descrevendo as pré-condições e os valores de entrada.
*   **Quando (Ação):** A cláusula "Quando", descrevendo a ação realizada (atualmente fixo como "Quando a operação é submetida").
*   **Então (Resultado Esperado):** A cláusula "Então", contendo o resultado determinado pelas suas regras ou pelo resultado padrão global.

### 5. Exportar para Excel

*   **Exportar para Excel (Botão):** Após gerar os casos de teste, clique neste botão para baixar um arquivo `.xlsx` contendo todos os casos de teste da tabela.

## Exemplo de Preenchimento

**1. Definir Campos de Entrada:**

*   **Campo 1:**
    *   Nome do Campo: `Email`
    *   Seus Exemplos: `teste@valido.com`
*   **Campo 2:**
    *   Nome do Campo: `Senha`
    *   Seus Exemplos: `senha123`

**2. Definir Regras de Teste:**

*   **Regra 1:**
    *   Condição 1: Campo `Email`, Operador `Texto é Igual a (ignora caso)`, Valor `teste@valido.com`
    *   Condição 2: Campo `Senha`, Operador `Texto é Igual a (ignora caso)`, Valor `senha123`
    *   Então Resultado = `Login bem-sucedido`
*   **Regra 2:**
    *   Condição 1: Campo `Email`, Operador `Está Vazio/Nulo`
    *   Então Resultado = `Erro - Email é obrigatório`
*   **Regra 3:**
    *   Condição 1: Campo `Senha`, Operador `Comprimento do Texto <`, Valor `6`
    *   Então Resultado = `Erro - Senha deve ter pelo menos 6 caracteres`

*   **Resultado Padrão Global:** `Falha no login - dados inválidos`

Ao clicar em "Gerar Casos de Teste", você verá combinações como:

*   Email: `teste@valido.com`, Senha: `senha123` -> Então: `Login bem-sucedido`
*   Email: `[VAZIO_PLACEHOLDER]`, Senha: `senha123` -> Então: `Erro - Email é obrigatório`
*   Email: `teste@valido.com`, Senha: `abc` -> Então: `Erro - Senha deve ter pelo menos 6 caracteres`
*   Email: `outro@email.com`, Senha: `outrasenha` -> Então: `Falha no login - dados inválidos` (assumindo que "outro@email.com" e "outrasenha" foram gerados automaticamente ou são exemplos que não se encaixam nas regras acima).

## Instalação (Desenvolvimento Local)

Se você baixou o código-fonte e deseja executá-lo localmente:

1.  Clone o repositório (se ainda não o fez):
    ```bash
    git clone https://github.com/SEU_USUARIO/permutador-condicoes.git
    cd permutador-condicoes
    ```
2.  Abra o arquivo `index.html` em seu navegador web.

Não há dependências de backend ou build steps complexos para a interface do usuário, pois é um projeto HTML, CSS e JavaScript puro para o frontend.

## Contribuindo

Contribuições são bem-vindas! Se você tem sugestões para melhorar este projeto, sinta-se à vontade para fazer um fork do repositório e criar um pull request, ou abrir uma issue com a tag "enhancement".

1.  **Faça um Fork** do projeto.
2.  **Crie uma Nova Branch** (`git checkout -b minha-nova-feature`).
3.  **Faça suas Alterações**.
4.  **Faça o Commit** das suas alterações (`git commit -m "Adiciona minha nova feature"`).
5.  **Envie para o Repositório Remoto** (`git push origin minha-nova-feature`).
6.  **Abra um Pull Request**.
