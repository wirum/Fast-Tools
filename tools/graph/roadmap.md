# Graph v2: checklist do roadmap

Estado conferido contra o branch `Graph-v2` (24/11/2026).

## Concluído

- [x] Independência dos gráficos: `categories` e `series` dentro de cada gráfico
- [x] Item 6: seletor de tipo (bar, line, area) salvo em `graph.type`, validado por `allowedChartTypes`
- [x] Item 9 (parcial): nome vazio mostra erro junto ao campo e Enter salva nos 3 modais
- [x] Item 9 (parcial): nome de gráfico novo usa o menor número livre
- [x] Item 11: campo vazio vale `0` e os campos aceitam decimais (`step="any"`)
- [x] Item 12: exportar e importar dataset em JSON
- [x] Item 15: fallback quando o ApexCharts não carrega
- [x] Validação confere o tamanho de `series[].data` contra `categories`
- [x] Excluir dataset limpa o gráfico, e criar gráfico já o seleciona
- [x] Salvamento acontece no `change`, não a cada tecla (debounce não é necessário)

## Item 13: várias séries editáveis

Os dados já suportam várias séries. Falta só a interface.

- [x] Adicionar e remover categoria percorrem todas as séries
- [x] Validação confere cada série e o tamanho de `data`
- [x] `updateSeries` recebe a lista inteira
- [x] Botão para criar série (nasce com `data` do tamanho das categorias) --> 24/11
- [x] Renomear série --> 24/11
- [x] Remover série --> 24/11
- [x] Escolher qual série está sendo editada --> 24/11
- [x] Campo de valor deixar de usar `series[0]` fixo (linhas ~908 a 915) --> ?

## Item 9: nomes repetidos ao renomear (restante)

- [x] Definir a regra para nomes repetidos: nomes únicos dentro do mesmo nível, ignorando maiúsculas/minúsculas e espaços externos --> 24/11
- [x] Aplicar ao renomear gráfico --> 24/11
- [x] Aplicar ao renomear dataset --> 24/11
- [x] Aplicar ao renomear categoria --> 24/11
- [x] Mostrar o erro junto ao campo, igual ao de nome vazio --> 24/11

## Item 10: layout e acessibilidade

Já existe:

- [x] Ações são `<button>` de verdade
- [x] Modais e select de tipo têm `<label for>`
- [x] `:focus-visible` global
- [x] `lang` e `viewport` no HTML

Falta:

- [ ] Os 3 `dropdown-header` virarem botões com estado (`aria-expanded`)
- [ ] `dataset-item` e `graph-item` virarem botões
- [ ] Nome acessível nos botões de ícone do HTML (configurações, config do gráfico, exportar, importar)
- [ ] Nome acessível nos botões de editar e excluir categoria (criados no JS)
- [ ] Rótulo nos campos de valor das categorias
- [ ] Criar `@media` para empilhar ou recolher a sidebar em telas estreitas
- [ ] Validar Tab, Enter/Espaço e leitor de tela

## Item 15: estados e recursos auxiliares (restante)

- [x] Remover o CSS órfão `.delete-graph-config-modal` (sem elemento no HTML)

## Item 14: testes

- [ ] Criar pasta de testes do Graph (copiar o padrão do Calcify)
- [ ] Casos: criação, edição, persistência, JSON inválido, estrutura malformada, erro de storage
- [ ] Casos: exclusão, nomes únicos, troca de tipo
- [ ] Testes reais de navegador, teclado e viewport móvel

## Adiado 

- [ ] Item 4: recuperação automática de dados inválidos (V3, só se surgirem dados reais a preservar)

## Detalhes opcionais

- [ ] Renomear `ChartSelect()` para `syncChartSelect()` (padrão dos outros nomes de função)
- [ ] Confirmar se import funciona com backup da OSOD