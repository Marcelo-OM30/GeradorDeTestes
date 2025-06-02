document.addEventListener('DOMContentLoaded', () => {
    const inputFieldsContainer = document.getElementById('inputFieldsContainer');
    const addInputFieldButton = document.getElementById('addInputFieldButton');
    const rulesContainer = document.getElementById('rulesContainer');
    const addRuleButton = document.getElementById('addRuleButton');
    const defaultOutcomeEl = document.getElementById('defaultOutcome');
    const generateButton = document.getElementById('generateButton');
    const resultsTableHead = document.querySelector('#resultsTable thead');
    const resultsTableBody = document.querySelector('#resultsTable tbody');
    const exportToExcelButton = document.getElementById('exportToExcelButton'); // Get the export button

    let inputFieldCounter = 0;
    let ruleCounter = 0;
    let definedInputFields = []; 

    const OPERATORS = {
        IS_EMPTY: "Está Vazio/Nulo",
        IS_NOT_EMPTY: "Não Está Vazio/Nulo",
        EQUALS_STRING: "Texto é Igual a (ignora caso)",
        NOT_EQUALS_STRING: "Texto Não é Igual a (ignora caso)",
        CONTAINS: "Texto Contém (ignora caso)",
        NOT_CONTAINS: "Texto Não Contém (ignora caso)",
        NUM_EQ: "Número é Igual a",
        NUM_NEQ: "Número Não é Igual a",
        NUM_GT: "Número >",
        NUM_GTE: "Número >=",
        NUM_LT: "Número <",
        NUM_LTE: "Número <=",
        LENGTH_EQ: "Comprimento do Texto é Igual a",
        LENGTH_GT: "Comprimento do Texto >",
        LENGTH_GTE: "Comprimento do Texto >=",
        LENGTH_LT: "Comprimento do Texto <",
        LENGTH_LTE: "Comprimento do Texto <=",
        REGEX_MATCH: "Texto Corresponde à Regex"
    };

    // Unified placeholder for empty values
    const PLACEHOLDER_EMPTY = "[VAZIO_PLACEHOLDER]"; 
    const PLACEHOLDER_GENERIC_VALID = "[VALIDO_GENERICO]";
    const PLACEHOLDER_LONG_TEXT = "[TEXTO_MUITO_LONGO_ABC...XYZ123...]";
    const PLACEHOLDER_SPECIAL_CHARS = "[!@#$%^&*()]";

    function updateDefinedInputFields() {
        definedInputFields = Array.from(inputFieldsContainer.querySelectorAll('.input-field-name'))
                                 .map(input => input.value.trim())
                                 .filter(name => name !== '');
        document.querySelectorAll('.condition-row .field-select').forEach(select => {
            const currentVal = select.value;
            select.innerHTML = '<option value="">--Selecione Campo--</option>';
            definedInputFields.forEach(fieldName => {
                const option = document.createElement('option');
                option.value = fieldName;
                option.textContent = fieldName;
                select.appendChild(option);
            });
            if (definedInputFields.includes(currentVal)) {
                select.value = currentVal;
            } else {
                select.value = ""; 
            }
        });
    }

    function addInputField() {
        inputFieldCounter++;
        const fieldId = `input-field-${inputFieldCounter}`;
        const fieldDiv = document.createElement('div');
        fieldDiv.classList.add('input-field-block');
        fieldDiv.setAttribute('id', fieldId);
        fieldDiv.innerHTML = `
            <label for="${fieldId}-name">Nome do Campo ${inputFieldCounter}:</label>
            <input type="text" id="${fieldId}-name" class="input-field-name" placeholder="Ex: NomeCliente, ValorPedido">
            <label for="${fieldId}-examples">Seus Exemplos de Valores (um por linha):</label>
            <textarea id="${fieldId}-examples" class="input-field-examples" placeholder="Ex: ValorVálido1\nOutroValor\n123\n(Opcional, complementa a geração automática)"></textarea>
            <button type="button" class="remove-button remove-input-field-button">Remover Campo</button>
        `;
        fieldDiv.querySelector('.input-field-name').addEventListener('change', updateDefinedInputFields);
        fieldDiv.querySelector('.remove-input-field-button').addEventListener('click', () => {
            fieldDiv.remove();
            updateDefinedInputFields();
        });
        inputFieldsContainer.appendChild(fieldDiv);
        updateDefinedInputFields(); 
    }

    function addConditionToRule(conditionsContainerEl) {
        const conditionRow = document.createElement('div');
        conditionRow.classList.add('condition-row');
        
        const fieldLabel = document.createElement('label');
        fieldLabel.textContent = "Campo:";
        const fieldSelect = document.createElement('select');
        fieldSelect.classList.add('field-select');
        fieldSelect.innerHTML = '<option value="">--Selecione Campo--</option>';
        definedInputFields.forEach(fieldName => {
            const option = document.createElement('option');
            option.value = fieldName;
            option.textContent = fieldName;
            fieldSelect.appendChild(option);
        });

        const operatorLabel = document.createElement('label');
        operatorLabel.textContent = "Operador:";
        const operatorSelect = document.createElement('select');
        operatorSelect.classList.add('operator-select');
        for (const key in OPERATORS) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = OPERATORS[key];
            operatorSelect.appendChild(option);
        }

        const valueLabel = document.createElement('label');
        valueLabel.textContent = "Valor de Referência:";
        const valueInput = document.createElement('input');
        valueInput.classList.add('condition-value-input');
        valueInput.setAttribute('type', 'text');
        valueInput.setAttribute('placeholder', 'Valor para o operador'); 

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button', 'remove-condition-button');
        removeButton.setAttribute('type', 'button');
        removeButton.textContent = 'X';
        removeButton.title = "Remover esta condição";
        removeButton.addEventListener('click', () => conditionRow.remove());

        conditionRow.appendChild(fieldLabel);
        conditionRow.appendChild(fieldSelect);
        conditionRow.appendChild(operatorLabel);
        conditionRow.appendChild(operatorSelect);
        conditionRow.appendChild(valueLabel);
        conditionRow.appendChild(valueInput);
        conditionRow.appendChild(removeButton);
        conditionsContainerEl.appendChild(conditionRow);
    }

    function createRuleElement() {
        ruleCounter++;
        const ruleId = `rule-${ruleCounter}`;
        const ruleDiv = document.createElement('div');
        ruleDiv.classList.add('rule-block');
        ruleDiv.setAttribute('id', ruleId);

        const conditionsContainer = document.createElement('div');
        conditionsContainer.classList.add('conditions-container');
        
        ruleDiv.innerHTML = `
            <h3>Regra de Teste ${ruleCounter}</h3>
            <p style="font-size:0.85em; color:#555;">(Todas as condições abaixo devem ser verdadeiras para esta regra aplicar)</p>
        `;
        ruleDiv.appendChild(conditionsContainer); 

        const addConditionButton = document.createElement('button');
        addConditionButton.classList.add('control-button', 'add-condition-button');
        addConditionButton.setAttribute('type', 'button');
        addConditionButton.textContent = 'Adicionar Condição à Regra';
        addConditionButton.addEventListener('click', () => addConditionToRule(conditionsContainer));
        ruleDiv.appendChild(addConditionButton);
        
        const outcomeDiv = document.createElement('div');
        outcomeDiv.classList.add('rule-row', 'outcome');
        outcomeDiv.style.marginTop = '15px';
        outcomeDiv.innerHTML = `
            <label for="${ruleId}-outcome">Então Resultado =</label>
            <input type="text" id="${ruleId}-outcome" class="rule-outcome" value="Resultado Regra ${ruleCounter}">
        `;
        ruleDiv.appendChild(outcomeDiv);

        const removeRuleButton = document.createElement('button');
        removeRuleButton.classList.add('remove-button', 'remove-rule-button');
        removeRuleButton.setAttribute('type', 'button');
        removeRuleButton.textContent = 'Remover Regra de Teste';
        removeRuleButton.style.marginTop = '10px';
        removeRuleButton.addEventListener('click', () => ruleDiv.remove());
        ruleDiv.appendChild(removeRuleButton);

        rulesContainer.appendChild(ruleDiv);
        addConditionToRule(conditionsContainer); 
    }

    addInputFieldButton.addEventListener('click', addInputField);
    addRuleButton.addEventListener('click', createRuleElement);

    addInputField();
    createRuleElement();

    function getEquivalenceValues(fieldName, userExamples) {
        const values = new Set();

        if (userExamples && userExamples.length > 0) {
            userExamples.forEach(ex => values.add(ex.trim()));
        } else {
            values.add(PLACEHOLDER_GENERIC_VALID); 
        }
        values.add(PLACEHOLDER_EMPTY); // Uses the unified constant
        
        if (!userExamples || !userExamples.some(ex => ex.length > 100)) { 
             values.add(PLACEHOLDER_LONG_TEXT);
        }
        if (!userExamples || !userExamples.some(ex => /[!@#$%^&*()]/.test(ex))) { 
            values.add(PLACEHOLDER_SPECIAL_CHARS);
        }

        let looksNumeric = false;
        if (userExamples && userExamples.length > 0) {
            looksNumeric = userExamples.every(ex => ex.trim() === '' || !isNaN(parseFloat(ex.trim())));
        }
        if (!looksNumeric && fieldName) {
            const lowerFieldName = fieldName.toLowerCase();
            if (lowerFieldName.includes("valor") || lowerFieldName.includes("numero") || lowerFieldName.includes("qtd") || lowerFieldName.includes("id")) {
                looksNumeric = true;
            }
        }

        if (looksNumeric) {
            values.add("0");
            values.add("-1"); 
            values.add("999999"); 
            if (!userExamples || !userExamples.some(ex => isNaN(parseFloat(ex.trim())) && ex.trim() !== '')) {
                 values.add("[NAO_NUMERICO]"); 
            }
        }
        return Array.from(values).filter(v => v !== undefined && v !== null);
    }

    function evaluateSingleCondition(inputValueStr, operator, ruleValueStr) {
        const valStr = String(inputValueStr).trim(); 
        const ruleValStr = String(ruleValueStr).trim();
        let numVal, numRuleVal;

        switch (operator) {
            case 'IS_EMPTY':
                return valStr === '' || valStr.toUpperCase() === 'NULO' || valStr.toUpperCase() === 'VAZIO' || valStr === PLACEHOLDER_EMPTY;
            case 'IS_NOT_EMPTY':
                return !(valStr === '' || valStr.toUpperCase() === 'NULO' || valStr.toUpperCase() === 'VAZIO' || valStr === PLACEHOLDER_EMPTY);
            case 'EQUALS_STRING':
                return valStr.toUpperCase() === ruleValStr.toUpperCase();
            case 'NOT_EQUALS_STRING':
                return valStr.toUpperCase() !== ruleValStr.toUpperCase();
            case 'CONTAINS':
                return valStr.toUpperCase().includes(ruleValStr.toUpperCase());
            case 'NOT_CONTAINS':
                return !valStr.toUpperCase().includes(ruleValStr.toUpperCase());
            
            case 'NUM_EQ': case 'NUM_NEQ': case 'NUM_GT': case 'NUM_GTE': case 'NUM_LT': case 'NUM_LTE':
                numVal = parseFloat(valStr);
                numRuleVal = parseFloat(ruleValStr);
                if (isNaN(numVal) || isNaN(numRuleVal)) return false; 
                if (operator === 'NUM_EQ') return numVal === numRuleVal;
                if (operator === 'NUM_NEQ') return numVal !== numRuleVal;
                if (operator === 'NUM_GT') return numVal > numRuleVal;
                if (operator === 'NUM_GTE') return numVal >= numRuleVal;
                if (operator === 'NUM_LT') return numVal < numRuleVal;
                if (operator === 'NUM_LTE') return numVal <= numRuleVal;
                break;

            case 'LENGTH_EQ': case 'LENGTH_GT': case 'LENGTH_GTE': case 'LENGTH_LT': case 'LENGTH_LTE':
                numRuleVal = parseInt(ruleValStr, 10);
                if (isNaN(numRuleVal)) return false; // Se o valor de referência não for um número, a condição da regra de comprimento falha
                const len = valStr.length;
                if (operator === 'LENGTH_EQ') return len === numRuleVal;
                if (operator === 'LENGTH_GT') return len > numRuleVal;
                if (operator === 'LENGTH_GTE') return len >= numRuleVal; // Para "Ma" (len=2) e ruleVal=3, 2 >= 3 é FALSO
                if (operator === 'LENGTH_LT') return len < numRuleVal;
                if (operator === 'LENGTH_LTE') return len <= numRuleVal;
                break;
            case 'REGEX_MATCH':
                try {
                    const regex = new RegExp(ruleValStr);
                    return regex.test(valStr);
                } catch (e) {
                    console.error("Regex inválida:", ruleValStr, e);
                    return false;
                }
            default: return false;
        }
        return false;
    }

    function exportToExcel() {
        if (typeof XLSX === 'undefined') {
            alert("Erro: A biblioteca de exportação Excel (SheetJS) não foi carregada. Verifique a inclusão do script no HTML.");
            return;
        }

        const table = document.getElementById('resultsTable');
        if (!table || !resultsTableBody || resultsTableBody.rows.length === 0) {
            alert("Não há dados para exportar. Gere os casos de teste primeiro.");
            return;
        }

        const headerRowEl = resultsTableHead.querySelector('tr');
        if (!headerRowEl) {
            alert("Erro: Cabeçalho da tabela de resultados não encontrado.");
            return;
        }

        // Extract headers
        const headers = [];
        const headerCells = headerRowEl.querySelectorAll('th');
        if (headerCells.length === 0) {
            alert("Erro: Nenhuma coluna de cabeçalho encontrada na tabela.");
            return;
        }
        headerCells.forEach(cell => headers.push(cell.textContent.trim()));

        // Extract data rows
        const data = [];
        const rows = resultsTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            // Ensure it's a valid data row by comparing cell count to header count
            if (cells.length === headers.length) {
                const rowData = {};
                cells.forEach((cell, index) => {
                    if (headers[index]) { // Make sure header exists for this index
                        rowData[headers[index]] = cell.textContent.trim();
                    }
                });
                if (Object.keys(rowData).length > 0) { // Add row only if it has some data mapped to headers
                    data.push(rowData);
                }
            }
        });

        if (data.length === 0) {
            alert("Não há dados válidos na tabela para exportar. Verifique se os casos de teste foram gerados corretamente.");
            return;
        }

        try {
            // Create a new workbook and a worksheet
            const worksheet = XLSX.utils.json_to_sheet(data, { header: headers }); // Pass headers for column order
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "CasosDeTeste");

            // Generate Excel file and trigger download
            XLSX.writeFile(workbook, "CasosDeTesteGerados.xlsx");
        } catch (error) {
            console.error("Erro ao gerar o arquivo Excel:", error);
            alert("Ocorreu um erro ao tentar gerar o arquivo Excel. Verifique o console para mais detalhes.");
        }
    }

    generateButton.addEventListener('click', () => {
        resultsTableBody.innerHTML = '';
        resultsTableHead.innerHTML = ''; // Clears the static header, so we must rebuild it correctly
        let testCaseId = 1;

        const fieldDefinitions = [];
        document.querySelectorAll('.input-field-block').forEach(fieldDiv => {
            const name = fieldDiv.querySelector('.input-field-name').value.trim();
            const examplesText = fieldDiv.querySelector('.input-field-examples').value;
            if (name) {
                const userExamples = examplesText.trim().split('\n').map(ex => ex.trim()).filter(ex => ex !== '');
                const equivalenceValues = getEquivalenceValues(name, userExamples);
                if (equivalenceValues.length > 0) {
                    fieldDefinitions.push({ name, testValues: equivalenceValues });
                } else {
                    fieldDefinitions.push({ name, testValues: [`[${name}_SEM_VALORES]`] });
                }
            }
        });

        if (fieldDefinitions.length === 0) {
            resultsTableBody.innerHTML = '<tr><td colspan="5">Defina pelo menos um campo de entrada.</td></tr>';
            return;
        }

        const headerRow = resultsTableHead.insertRow();
        // Explicitly create <th> elements for the header
        const headersText = ["ID", "Cenário de Teste", "Dado (Entradas)", "Quando (Ação)", "Então (Resultado Esperado)"];
        headersText.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        const parsedRules = [];
        document.querySelectorAll('.rule-block').forEach(ruleDiv => {
            const conditions = [];
            ruleDiv.querySelectorAll('.condition-row').forEach(condRow => {
                const fieldName = condRow.querySelector('.field-select').value;
                const operator = condRow.querySelector('.operator-select').value;
                const value = condRow.querySelector('.condition-value-input').value;
                if (fieldName && operator) { 
                    conditions.push({ fieldName, operator, value });
                }
            });
            const outcome = ruleDiv.querySelector('.rule-outcome').value;
            if (conditions.length > 0) { 
                 parsedRules.push({ conditions, outcome });
            }
        });
        const globalDefaultOutcome = defaultOutcomeEl.value || "Padrão Global";
        
        function getCartesianProduct(arrays) { 
            if (!arrays || arrays.length === 0) return [[]];
            return arrays.reduce((acc, curr) => {
                return acc.flatMap(a => curr.map(c => [...a, c]));
            }, [[]]);
        }

        const valueArraysForProduct = fieldDefinitions.map(fd => fd.testValues);
        const testCaseValueCombinations = getCartesianProduct(valueArraysForProduct);

        testCaseValueCombinations.forEach(comboValues => {
            if (comboValues.length !== fieldDefinitions.length) return; 

            const currentTestCaseInput = {};
            let givenClauseParts = [];
            let scenarioTitleParts = [];

            fieldDefinitions.forEach((fd, index) => {
                currentTestCaseInput[fd.name] = comboValues[index];
                givenClauseParts.push(`o campo '${fd.name}' é preenchido com '${comboValues[index]}'`);
                scenarioTitleParts.push(`${fd.name}='${comboValues[index]}'`);
            });

            let finalOutcome = globalDefaultOutcome; 
            for (const rule of parsedRules) {
                let allConditionsInRuleMet = true;
                for (const condition of rule.conditions) {
                    const inputValue = currentTestCaseInput[condition.fieldName];
                    if (inputValue === undefined) { 
                        allConditionsInRuleMet = false;
                        break;
                    }
                    if (!evaluateSingleCondition(inputValue, condition.operator, condition.value)) {
                        allConditionsInRuleMet = false; // Se uma condição da regra falhar, a regra inteira falha
                        break;
                    }
                }
                if (allConditionsInRuleMet) { // Somente se TODAS as condições da regra forem verdadeiras
                    finalOutcome = rule.outcome; 
                    break; 
                }
            }

            const row = resultsTableBody.insertRow();
            row.insertCell().textContent = testCaseId++;
            row.insertCell().textContent = `Teste com ${scenarioTitleParts.join(', ')}`;
            row.insertCell().textContent = `Dado que ${givenClauseParts.join(' E ')}`;
            row.insertCell().textContent = `Quando a operação é submetida`; 
            row.insertCell().textContent = `Então ${finalOutcome}`; // Usa o finalOutcome determinado
        });

        if (resultsTableBody.rows.length === 0 && fieldDefinitions.length > 0) {
             resultsTableBody.innerHTML = `<tr><td colspan="5">Nenhum caso de teste gerado. Verifique seus campos e regras.</td></tr>`;
        }
    });

    if (exportToExcelButton) {
        exportToExcelButton.addEventListener('click', exportToExcel);
    }
    const generateCypressButton = document.getElementById('generateCypressButton');
    const cypressTestsOutput = document.getElementById('cypressTestsOutput');
    const resultsTable = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];

    if (generateCypressButton) {
        generateCypressButton.addEventListener('click', () => {
            cypressTestsOutput.value = ''; // Clear previous output
            const rows = resultsTable.rows;
            let cypressTestsString = `describe('Conjunto de Testes Gerados', () => {\n`;

            if (rows.length === 0) {
                cypressTestsOutput.value = "// Nenhum caso de teste Gherkin gerado para converter.";
                return;
            }

            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].cells;
                // Assuming structure: ID, Cenário, Dado, Quando, Então
                if (cells.length < 5) continue; // Skip if row doesn't have enough data

                const testId = cells[0].textContent.trim();
                const scenario = cells[1].textContent.trim();
                const given = cells[2].textContent.trim().replace(/^Dado\s*/i, ''); // Remove "Dado "
                const then = cells[4].textContent.trim().replace(/^Então\s*/i, ''); // Remove "Então "

                // Sanitize scenario name for Cypress 'it' block
                const sanitizedScenario = scenario.replace(/'/g, "\\'").replace(/\n/g, " ");

                cypressTestsString += `\n  it('CT${testId}: ${sanitizedScenario}', () => {\n`;
                cypressTestsString += `    // Cenário: ${scenario}\n`;
                cypressTestsString += `    // Dado: ${given}\n`;
                cypressTestsString += `    // TODO: Implementar os passos de setup (Dado)\n`;
                cypressTestsString += `    // Exemplo: cy.visit('/');\n`;
                
                // Attempt to parse input fields from "Dado"
                // This is a basic parser, might need refinement based on actual "Dado" format
                const inputs = given.split(' E ');
                inputs.forEach(input => {
                    const parts = input.split(' é ');
                    if (parts.length === 2) {
                        const fieldName = parts[0].trim().replace(/"/g, '').replace(/\s+/g, '_').toLowerCase(); // e.g., "Nome do Campo" -> nome_do_campo
                        const fieldValue = parts[1].trim().replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes
                        // Placeholder for interacting with an input field
                        // You'll need to map fieldName to actual selectors
                        cypressTestsString += `    // cy.get('[data-testid="${fieldName}"]').type('${fieldValue.replace(/'/g, "\\'")}');\n`;
                    }
                });

                cypressTestsString += `\n    // TODO: Implementar a ação (Quando)\n`;
                cypressTestsString += `    // Exemplo: cy.get('button[type="submit"]').click();\n`;

                cypressTestsString += `\n    // Então: ${then}\n`;
                cypressTestsString += `    // TODO: Implementar as asserções (Então)\n`;
                cypressTestsString += `    // Exemplo: cy.get('.success-message').should('contain.text', '${then.replace(/'/g, "\\'")}');\n`;
                cypressTestsString += `  });\n`;
            }

            cypressTestsString += `\n});\n`;
            cypressTestsOutput.value = cypressTestsString;
        });
    }
});
