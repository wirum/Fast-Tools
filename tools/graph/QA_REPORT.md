# Relatório de QA — Graph (MVP)

**Data:** 14/11/2026  
**Ambiente:** página servida localmente a partir de `tools/graph` e testada no navegador integrado isolado, viewport desktop 1280 × 720. ApexCharts carregou; o console do navegador não registrou erros ou avisos durante as verificações.  
**Escopo:** auditoria funcional pela interface. Nenhum arquivo de implementação foi alterado. Foram usados somente datasets e gráficos temporários; ao final, foram excluídos pela interface e uma recarga confirmou que a lista ficou vazia.

## Resumo

Foram encontrados **4 problemas de severidade média**. Não foram encontrados problemas críticos ou altos.

As operações principais de criação, seleção, renomeação, edição de valores e exclusão funcionam. Os principais impedimentos para considerar o MVP estável são a impossibilidade de renomear categorias, a restauração automática de um gráfico excluído por completo e a interface que não volta ao estado correto após Back ou exclusão de dataset.

## Resultado dos testes

| Área | Resultado | Evidência observada |
|---|---|---|
| Criar e selecionar datasets | **Aprovado** | Criei `QA Alpha` e `QA Beta`; ambos apareceram na lista e cada seleção mostrou o nome e o conjunto de gráficos correspondente. |
| Alternar entre datasets | **Aprovado** | Alternei entre Alpha e Beta. As categorias e valores de Alpha não apareceram em Beta; ao voltar para Alpha, reapareceram. |
| Excluir dataset e atualizar interface | **Reprovado** | O dataset foi removido da lista de dados, mas a tela permaneceu no modo de gráficos; o botão “New dataset” ficou oculto até clicar em Back. Ver BUG-03. |
| Criar, selecionar e renomear gráficos | **Aprovado** | Criar `Graph 2` manteve a seleção anterior. Selecionar o segundo gráfico atualizou o título; salvar `Ventas` atualizou título e lista. Um nome em branco não foi salvo. |
| Excluir gráfico sem afetar os demais | **Aprovado** | Excluí `Ventas`: `Graph 1` permaneceu na lista, a seleção foi limpa e a visualização ficou sem barras. |
| Excluir o último gráfico | **Parcial** | A lista ficou vazia e a visualização sem barras. Após recarregar e selecionar o dataset, surgiu um novo `Graph 1` automaticamente. Ver BUG-02. |
| Adicionar e excluir categorias | **Aprovado** | Adicionei `Jan` e `Feb`; excluir `Jan` deixou `Feb` com o valor 28 e uma barra, sem deslocamento dos dados. Excluir a última categoria deixou zero categorias e zero barras. |
| Editar nome de categoria | **Reprovado** | A linha da categoria tem texto estático (`span`), um campo numérico e um botão de exclusão. Não existe campo ou ação para renomear. Ver BUG-01. |
| Alterar valores das séries | **Aprovado** | Defini `Jan=12` e `Feb=28`; a visualização mostrou duas barras. Depois de excluir `Jan`, `Feb=28` permaneceu alinhado. |
| Campos vazios | **Aprovado** | Enviar o formulário de dataset vazio não criou dataset e manteve o modal aberto com a validação obrigatória. Categoria em branco/espaços não criou linha; salvar nome de gráfico vazio não alterou o nome. |
| Estados sem dataset/categorias/gráficos | **Parcial** | O estado inicial sem datasets, um dataset sem categorias, e a tela sem gráfico selecionado foram exibidos sem erro e sem barras. Excluir o último gráfico funcionou até a recarga; após exclusão de dataset, os controles de lista ficaram ocultos até Back. |
| Persistência após recarga | **Parcial** | `QA Persist`, `Graph 1`, `Persisted Graph`, categoria `Metric` e valor 9 reapareceram após recarga com as contagens esperadas (1 dataset, 2 gráficos, 1 categoria). Valores `Feb=28` e `Mar=5` também foram restaurados em outro ciclo. A exceção é a recriação do último gráfico excluído (BUG-02). |
| Back e visibilidade de configuração | **Reprovado** | Back voltou à lista e limpou as barras, mas “settings” e “Select a graph” continuaram visíveis quando nenhum dataset estava selecionado. Ver BUG-04. |
| Gráfico sem seleção | **Aprovado visualmente** | Com dataset sem gráfico selecionado e após excluir o gráfico atual, a contagem de barras foi zero. O gráfico manteve apenas os eixos vazios. |

## Bugs encontrados

### BUG-01 — Não é possível renomear categorias

**Severidade: média**  
**Reprodução:** selecione um dataset e um gráfico, adicione uma categoria e tente editar o rótulo. A interface mostra o nome como texto estático, um input `number` para o valor e um botão `delete`; não há input de texto nem ação de edição.  
**Impacto:** erros de digitação ou mudanças no significado de um rótulo não podem ser corrigidos pela interface.

**Arquivos/funções:** `index.html` (editor de dados, linhas 77–80); `js/script.js`, `renderCategories()` (linhas 375–429; criação do nome como `span` e do valor como `input type="number"`).

### BUG-02 — Excluir todos os gráficos não persiste o estado vazio

**Severidade: média**  
**Reprodução:** deixe o dataset sem gráficos excluindo o último; confirme que a lista fica vazia; recarregue a página e selecione o dataset. A aplicação mostra `Graph 1` novamente, embora ele tivesse sido excluído.  
**Impacto:** há recriação inesperada de dados e o estado vazio não sobrevive à recarga. O código de inicialização insere um gráfico padrão sempre que `graphs` está ausente ou vazio.

**Arquivo/função:** `js/script.js`, inicialização de `datasets` (linhas 22–30). A confirmação de exclusão do gráfico grava a lista vazia em `localStorage` (linhas 310–329), mas a inicialização seguinte volta a preenchê-la.

### BUG-03 — Excluir um dataset não retorna a interface à lista

**Severidade: média**  
**Reprodução:** abra as configurações de um dataset selecionado e confirme “Delete dataset”. O nome principal muda para “Select a dataset” e o item excluído sai dos dados, mas a tela continua mostrando o submodo de gráficos (por exemplo, `Graph 1`, `New graph` e `Back`). `New dataset` permanece oculto até pressionar Back. Ao excluir o último dataset, “No datasets yet” aparece, mas o botão de criação também continua oculto nesse submodo.  
**Impacto:** a exclusão não deixa a interface pronta para selecionar ou criar outro dataset; o usuário precisa executar uma navegação adicional para recuperar os controles corretos.

**Arquivo/função:** `js/script.js`, handler `confirmDeleteButton` (linhas 332–350). O handler filtra e renderiza os datasets, mas não restaura a visibilidade de `datasetList`, `newDatasetButton`, `graphList`, `newGraph` e `backDatasets`.

### BUG-04 — Back deixa controles e título de gráfico visíveis sem dataset

**Severidade: média**  
**Reprodução:** selecione um dataset e pressione Back. O título do dataset volta para “Select a dataset” e as barras são limpas, mas o botão de configurações do dataset e o título “Select a graph” continuam visíveis. Isso também ocorre após usar Back para sair do estado residual da exclusão.  
**Evidência técnica:** ambos os elementos ficam com `hidden === true`, mas o estilo computado continua `display: flex`, devido ao estilo inline aplicado quando um dataset é selecionado.  
**Impacto:** a interface indica que há contexto de dataset/gráfico quando nenhum foi selecionado; o botão de configurações não tem uma ação válida nesse estado.

**Arquivos/funções:** `js/script.js`, seleção em `renderDatasets()` (linhas 186–190, define `style.display = "flex"`) e handler `backDatasets` (linhas 439–463, define `hidden = true` sem limpar o estilo inline); `index.html` declara os elementos inicialmente ocultos (linhas 89 e 100).

## Limitações do teste

- Nenhuma etapa obrigatória ficou bloqueada por necessidade de interação manual. Os fluxos descritos foram executados pela interface.
- A execução foi feita em um único navegador integrado, em viewport desktop e com servidor local; não foi feita matriz em outros navegadores, dispositivos móveis ou ambiente de produção.
- O seletor “Chart Types” mostra `Coming soon..`; por isso, a troca de tipo de gráfico não foi testada como funcionalidade disponível.
- Não foram alterados nem corrigidos arquivos de implementação.
